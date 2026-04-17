import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { Text, View, Alert, TextInput, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as api from '../utils/api';
import {Prediction} from "../.expo/types/model";
import LoadingScreen from '@/components/common/loading-screen';
import MarketDetailsHeader from "@/components/market/market-detail-header";
import MarketDetailBalance from "@/components/market/market-detail-balance";
import MarketDetailSummary from "@/components/market/market-detail-summary";
import MarketDetailTrendChart from "@/components/market/market-detail-trend-chart";
import { CreateMarketField } from '@/components/market/create-market-field';
import { CreateMarketChipGroup } from '@/components/market/create-market-chip-group';
import { ExploreTheme } from "../constants/explore-theme";
import { useUserStore } from '@/context/useUserStore';
import { UI_COLORS, UI_SHADOWS, UI_TYPE_SCALE } from '@/constants/ui-tokens';
import { EmptyState } from '@/components/common/empty-state';
import { MarketUpdatedPayload, PortfolioUpdatedPayload, subscribeRealtime } from '@/context/realtimeClient';
import { useAuth } from '@/context/AuthContext';

const CREATE_MARKET_CATEGORIES = ['SPORTS', 'CRYPTO', 'POLITICS', 'CULTURE', 'TECHNOLOGY'];
const CREATE_DATE_PRESETS = [
  { label: '+1 day', days: 1 },
  { label: '+3 days', days: 3 },
  { label: '+7 days', days: 7 },
];
const QUICK_SHARE_PRESETS = ['1', '5', '10'];
const TIMEFRAME_OPTIONS: { label: string; value: api.MarketHistoryTimeframe }[] = [
  { label: '5M', value: '5m' },
  { label: '1H', value: '1h' },
  { label: '1D', value: '1d' },
  { label: '1W', value: '1w' },
];

const BUTTON_STATE_TOKENS = {
  active: {
    backgroundColor: UI_COLORS.accentSoft,
    borderColor: UI_COLORS.accentBorder,
    textColor: UI_COLORS.linkPressed,
  },
  inactive: {
    backgroundColor: UI_COLORS.surface,
    borderColor: UI_COLORS.borderSoft,
    textColor: ExploreTheme.titleText,
  },
  disabledOpacity: 0.6,
  primary: {
    backgroundColor: UI_COLORS.accent,
    textColor: UI_COLORS.surface,
    disabledBackgroundColor: UI_COLORS.borderMuted,
  },
  success: {
    backgroundColor: UI_COLORS.success,
    textColor: UI_COLORS.surface,
    disabledBackgroundColor: UI_COLORS.borderMuted,
  },
};
type CreateFieldKey = 'title' | 'description' | 'category' | 'resolutionDate';

type CommentSubmissionState =
  | { type: 'success'; message: string }
  | { type: 'error'; message: string }
  | null;

type TrendPoint = {
  value: number;
  timestamp: number;
};

const MAX_TREND_POINTS = 60;

const sanitizeDisplayText = (value: unknown): string => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.replace(/[\u0000-\u001F\u007F]/g, '').trim();
};

const toSafeMessage = (value: unknown, fallback: string): string => {
  if (typeof value !== 'string') {
    return fallback;
  }

  const normalized = sanitizeDisplayText(value);
  return normalized || fallback;
};

const normalizeProbability = (value: number) => {
  const normalized = value > 1 ? value / 100 : value;
  return Math.max(0, Math.min(1, normalized));
};

const formatOptionLabel = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const formatRelativeTime = (value: string): string => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'Now';
  }

  const diffMs = Date.now() - parsed.getTime();
  if (diffMs < 60_000) return 'Now';
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const formatHourMinute = (date: Date) => {
  const hour24 = date.getHours();
  const hour12 = hour24 % 12 || 12;
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${hour12}:${minute}`;
};

const formatTrendLabel = (
  timestamp: number,
  timeframe: api.MarketHistoryTimeframe,
  index: number
): string => {
  const date = new Date(timestamp);
  if (timeframe === '5m') {
    return formatHourMinute(date);
  }

  if (timeframe === '1h') {
    return `${date.getHours() % 12 || 12}:00`;
  }

  if (timeframe === '1w') {
    return `Week ${index + 1}`;
  }

  if (timeframe === '1d') {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }

  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

const getChartPointTarget = (timeframe: api.MarketHistoryTimeframe): number => {
  return 5;
};

const sampleTrendPointsForChart = (
  points: TrendPoint[],
  timeframe: api.MarketHistoryTimeframe
): TrendPoint[] => {
  if (points.length <= 1) {
    return points;
  }

  const target = getChartPointTarget(timeframe);
  if (points.length <= target) {
    return points;
  }

  const sampled: TrendPoint[] = [];
  const maxIndex = points.length - 1;
  for (let i = 0; i < target; i += 1) {
    const rawIndex = (i / (target - 1)) * maxIndex;
    const index = Math.round(rawIndex);
    sampled.push(points[index]);
  }

  return sampled;
};


export default function DetailsScreen() {
  const { id, mode } = useLocalSearchParams<{ id?: string; mode?: string }>();
  const marketID = id ? Number(id) : null;
  const hasRouteId = typeof id === 'string' && id.trim().length > 0;
  const hasInvalidMarketId = hasRouteId && (marketID === null || Number.isNaN(marketID) || marketID <= 0);
  const isCreateMode = mode === 'create' || !id;

  const [marketLoading, setMarketLoading] = useState(true);
  const [prediction, setPrediction] = useState<Prediction>();
  const [marketError, setMarketError] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [tradeLoading, setTradeLoading] = useState(false);
  const [tradeMessage, setTradeMessage] = useState<string | null>(null);
  const [tradeError, setTradeError] = useState<string | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [shareInput, setShareInput] = useState('1');
  const [tradeBalanceSnapshot, setTradeBalanceSnapshot] = useState<number | null>(null);
  const [userPosition, setUserPosition] = useState<number | null>(null);
  const [comments, setComments] = useState<api.CommentItem[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentSubmissionState, setCommentSubmissionState] = useState<CommentSubmissionState>(null);
  const [trendPoints, setTrendPoints] = useState<TrendPoint[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<api.MarketHistoryTimeframe>('1d');
  const [chartLoading, setChartLoading] = useState(false);
  const [chartError, setChartError] = useState<string | null>(null);
  const commentSuccessTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { userData, fetchUserData, setBalanceFromSnapshot } = useUserStore();
  const { token, isLoading: authLoading } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('SPORTS');
  const [resolutionDate, setResolutionDate] = useState('');
  const [createErrors, setCreateErrors] = useState<Partial<Record<CreateFieldKey, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const tradeOptions = useMemo(() => {
    if (!prediction?.options?.length) return [];
    return prediction.options;
  }, [prediction]);

  const loadMarketData = useCallback(async () => {
    if (isCreateMode) {
      setMarketLoading(false);
      setMarketError(null);
      return;
    }

    if (marketID === null || Number.isNaN(marketID) || marketID <= 0) {
      setPrediction(undefined);
      setMarketError('Invalid market link. Please return and open the market again.');
      setMarketLoading(false);
      return;
    }

    setMarketLoading(true);
    setMarketError(null);
    const { ok, data } = await api.get(`/markets/${marketID}`);
    if (ok) {
      const nextPrediction = data?.data ?? null;
      if (!nextPrediction) {
        setPrediction(undefined);
        setMarketError('Market details are unavailable right now.');
      } else {
        setPrediction(nextPrediction);
      }
    } else {
      const nextError = toSafeMessage(data?.error, 'Unable to load market details right now.');
      setPrediction(undefined);
      setMarketError(nextError);
      Alert.alert('Unable to load market', nextError);
    }
    setMarketLoading(false);
  }, [isCreateMode, marketID]);

  useEffect(() => {
    void loadMarketData();
    }, [loadMarketData]);

  useEffect(() => {
    if (!isCreateMode) {
      fetchUserData();
    }
  }, [fetchUserData, isCreateMode]);

  useEffect(() => {
    if (!prediction?.options?.length) {
      setSelectedOptionId(null);
      return;
    }

    setSelectedOptionId((prev) => {
      if (prev && prediction.options.some((option) => option.id === prev)) {
        return prev;
      }

      return prediction.options[0].id;
    });
  }, [prediction]);

  useEffect(() => {
    if (commentSubmissionState?.type !== 'success') {
      if (commentSuccessTimerRef.current) {
        clearTimeout(commentSuccessTimerRef.current);
        commentSuccessTimerRef.current = null;
      }
      return;
    }

    commentSuccessTimerRef.current = setTimeout(() => {
      setCommentSubmissionState((current) => (current?.type === 'success' ? null : current));
      commentSuccessTimerRef.current = null;
    }, 2500);

    return () => {
      if (commentSuccessTimerRef.current) {
        clearTimeout(commentSuccessTimerRef.current);
        commentSuccessTimerRef.current = null;
      }
    };
  }, [commentSubmissionState]);

  useEffect(() => {
    setTrendPoints([]);
    setChartError(null);
  }, [marketID]);

  const loadUserPosition = useCallback(async () => {
    if (isCreateMode || marketID === null || Number.isNaN(marketID) || marketID <= 0) {
      setUserPosition(null);
      return;
    }

    if (authLoading) {
      return;
    }

    if (!token) {
      setUserPosition(null);
      return;
    }

    try {
      const { ok, data } = await api.getPortfolioPositionByMarketId(marketID);
      if (!ok) {
        setUserPosition(null);
        return;
      }

      const snapshot = data?.snapshot;
      const rawTotalShares = Number(snapshot?.total_shares ?? snapshot?.totalShares);
      const options = Array.isArray(snapshot?.options) ? snapshot.options : [];
      const optionsTotal = options.reduce((sum: number, item: unknown) => {
        if (!item || typeof item !== 'object') {
          return sum;
        }

        const optionRecord = item as Record<string, unknown>;
        const shares = Number(optionRecord.shares_owned ?? optionRecord.sharesOwned);
        return Number.isFinite(shares) ? sum + shares : sum;
      }, 0);

      const totalShares = Number.isFinite(rawTotalShares) ? rawTotalShares : optionsTotal;
      if (Number.isFinite(totalShares)) {
        setUserPosition(totalShares);
      } else {
        setUserPosition(null);
      }
    } catch {
      setUserPosition(null);
      return;
    }
  }, [authLoading, isCreateMode, marketID, token]);

  const loadMarketHistory = useCallback(async () => {
    if (isCreateMode || marketID === null || Number.isNaN(marketID) || marketID <= 0) {
      setTrendPoints([]);
      setChartError(null);
      return;
    }

    setChartLoading(true);
    setChartError(null);

    const { ok, data } = await api.getMarketHistory(marketID, selectedTimeframe, selectedOptionId);
    if (!ok) {
      setChartError(toSafeMessage((data as Record<string, unknown>)?.error, 'Chart data is temporarily unavailable.'));
      setChartLoading(false);
      return;
    }

    const nextPoints = Array.isArray(data?.points)
      ? data.points
          .map((point: api.MarketHistoryPoint) => {
            const timestamp = new Date(point.ts).getTime();
            if (Number.isNaN(timestamp)) {
              return null;
            }

            return {
              value: Math.max(0, Math.min(100, Number(point.probability))),
              timestamp,
            };
          })
          .filter((point: TrendPoint | null): point is TrendPoint => Boolean(point))
      : [];

    setTrendPoints(nextPoints.slice(-MAX_TREND_POINTS));
    setChartLoading(false);
  }, [isCreateMode, marketID, selectedOptionId, selectedTimeframe]);

  const loadComments = useCallback(async () => {
    if (marketID === null || Number.isNaN(marketID) || marketID <= 0) {
      setComments([]);
      setCommentsError(null);
      return;
    }

    setCommentsLoading(true);
    setCommentsError(null);
    const { ok, data } = await api.getComments(marketID);
    if (ok) {
      const normalizedComments = Array.isArray(data?.data)
        ? data.data
            .map((item: unknown) => {
              if (!item || typeof item !== 'object') {
                return null;
              }

              const candidate = item as Partial<api.CommentItem>;
              const content = sanitizeDisplayText(candidate.content);
              if (!content) {
                return null;
              }

              return {
                id: typeof candidate.id === 'string' ? candidate.id : `comment-${Date.now()}-${Math.random()}`,
                market_id: typeof candidate.market_id === 'number' ? candidate.market_id : marketID,
                user_id: sanitizeDisplayText(candidate.user_id) || 'Anonymous',
                content,
                created_at: typeof candidate.created_at === 'string' ? candidate.created_at : new Date().toISOString(),
              } satisfies api.CommentItem;
            })
            .filter((item: api.CommentItem | null): item is api.CommentItem => Boolean(item))
        : [];

      setComments(
        normalizedComments.sort(
          (a: api.CommentItem, b: api.CommentItem) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      );
    } else {
      setComments([]);
      setCommentsError(toSafeMessage(data?.error, 'Unable to load comments right now.'));
    }
    setCommentsLoading(false);
  }, [marketID]);

  useEffect(() => {
    if (!isCreateMode) {
      void loadComments();
    }
  }, [isCreateMode, loadComments]);

  useEffect(() => {
    if (!isCreateMode && !authLoading) {
      void loadUserPosition();
    }
  }, [authLoading, isCreateMode, loadUserPosition]);

  useEffect(() => {
    if (!isCreateMode) {
      void loadMarketHistory();
    }
  }, [isCreateMode, loadMarketHistory]);

  const validateCreateForm = useCallback(() => {
    const normalizedCategory = category.trim().toUpperCase();
    const nextErrors: Partial<Record<CreateFieldKey, string>> = {};

    if (!title.trim()) {
      nextErrors.title = 'Title is required.';
    }

    if (!description.trim()) {
      nextErrors.description = 'Description is required.';
    }

    if (!normalizedCategory) {
      nextErrors.category = 'Category is required.';
    }

    if (!resolutionDate.trim()) {
      nextErrors.resolutionDate = 'Resolution date is required.';
    }

    if (normalizedCategory && !CREATE_MARKET_CATEGORIES.includes(normalizedCategory)) {
      nextErrors.category = `Use one of: ${CREATE_MARKET_CATEGORIES.join(', ')}`;
    }

    const parsedDate = new Date(resolutionDate);
    if (resolutionDate.trim() && Number.isNaN(parsedDate.getTime())) {
      nextErrors.resolutionDate = 'Use ISO date format, for example 2026-12-31T00:00:00.000Z';
    }

    setCreateErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return null;
    }

    return {
      normalizedCategory,
      parsedDate,
      optionValues: ['Yes', 'No'],
    };
  }, [category, description, resolutionDate, title]);

  const handleCreateMarket = useCallback(async () => {
    const validated = validateCreateForm();
    if (!validated) {
      return;
    }

    setSubmitLoading(true);
    setSubmitMessage(null);
    setSubmitError(null);

    const { ok, data } = await api.createMarket({
      title: title.trim(),
      description: description.trim(),
      category: validated.normalizedCategory,
      endDate: validated.parsedDate.toISOString(),
      options: validated.optionValues,
    });

    setSubmitLoading(false);

    if (!ok) {
      setSubmitError(data?.error ?? 'Unable to submit market right now.');
      return;
    }

    setSubmitMessage(data?.message ?? 'Market submitted and pending admin approval.');
    setTitle('');
    setDescription('');
    setCategory('SPORTS');
    setResolutionDate('');
    setCreateErrors({});
    setSubmitError(null);
  }, [title, description, validateCreateForm]);

  const applyDatePreset = useCallback((daysFromNow: number) => {
    const presetDate = new Date(Date.now() + daysFromNow * 86_400_000).toISOString();
    setResolutionDate(presetDate);
    setCreateErrors((prev) => ({ ...prev, resolutionDate: undefined }));
  }, []);

  const handleBuyTrade = useCallback(async (optionIdOverride?: number) => {
    if (!prediction) {
      return;
    }

    if (tradeLoading) {
      return;
    }

    const optionIdToUse = optionIdOverride ?? selectedOptionId;

    if (!optionIdToUse) {
      Alert.alert('Missing option', 'Please select an option before placing a trade.');
      return;
    }

    const shares = Number(shareInput);
    if (!Number.isFinite(shares) || shares <= 0) {
      Alert.alert('Invalid shares', 'Enter a shares value greater than 0.');
      return;
    }

    setTradeLoading(true);
    setTradeMessage(null);
    setTradeError(null);

    try {
      const { ok, data } = await api.buyShares({
        optionId: optionIdToUse,
        shares,
      });

      if (!ok) {
        const message = data?.error ?? 'Unable to execute trade right now.';
        setTradeError(message);
        Alert.alert('Trade failed', message);
        return;
      }

      if (typeof data?.snapshot?.balance === 'number') {
        setBalanceFromSnapshot(data.snapshot.balance);
        setTradeBalanceSnapshot(data.snapshot.balance);
      }

      const sharesOwned = Number(data?.snapshot?.position?.sharesOwned);
      if (Number.isFinite(sharesOwned)) {
        setUserPosition(sharesOwned);
      }

      setTradeMessage(data?.message ?? 'Trade submitted successfully.');
      const refreshedProfile = await fetchUserData();
      if (typeof refreshedProfile?.balance === 'number') {
        setTradeBalanceSnapshot(null);
      } else {
        setTradeError('Trade succeeded. Account refresh is delayed, showing snapshot balance.');
      }

      await loadMarketData();
      await loadUserPosition();
    } catch {
      setTradeError('Trade completed, but account refresh is delayed. Pull to refresh and try again.');
    } finally {
      setTradeLoading(false);
    }
  }, [prediction, tradeLoading, selectedOptionId, shareInput, setBalanceFromSnapshot, fetchUserData, loadMarketData, loadUserPosition]);

  const parsedShares = Number(shareInput);
  const hasValidShares = Number.isFinite(parsedShares) && parsedShares > 0;

  const selectedOption = useMemo(() => {
    if (!prediction || !selectedOptionId) return null;
    return prediction.options.find((option) => option.id === selectedOptionId) ?? null;
  }, [prediction, selectedOptionId]);

  const pricePerShare = useMemo(() => {
    const raw = Number(selectedOption?.probability);
    if (!Number.isFinite(raw)) return null;
    return raw > 1 ? raw / 100 : raw;
  }, [selectedOption]);

  const estimatedCost = useMemo(() => {
    if (!hasValidShares || pricePerShare === null) return null;
    return parsedShares * pricePerShare;
  }, [hasValidShares, parsedShares, pricePerShare]);

  const estimatedWinnings = useMemo(() => {
    if (!hasValidShares || estimatedCost === null) {
      return null;
    }

    return Math.max(0, parsedShares - estimatedCost);
  }, [hasValidShares, parsedShares, estimatedCost]);

  const leadingOption = useMemo(() => {
    if (!tradeOptions.length) {
      return null;
    }

    return tradeOptions.reduce((top, option) => {
      const topProb = normalizeProbability(Number(top.probability));
      const optionProb = normalizeProbability(Number(option.probability));
      return optionProb > topProb ? option : top;
    });
  }, [tradeOptions]);

  const impliedProbability = useMemo(() => {
    if (!leadingOption) {
      return null;
    }

    return normalizeProbability(Number(leadingOption.probability)) * 100;
  }, [leadingOption]);

  const selectedProbability = useMemo(() => {
    if (!selectedOption) {
      return null;
    }

    return normalizeProbability(Number(selectedOption.probability)) * 100;
  }, [selectedOption]);

  const liveProbability = useMemo(() => {
    return selectedProbability ?? impliedProbability;
  }, [impliedProbability, selectedProbability]);

  const tradeActionLabel = useMemo(() => {
    if (!selectedOption?.name) {
      return 'Buy Option';
    }

    return `Buy ${formatOptionLabel(selectedOption.name)}`;
  }, [selectedOption]);

  const chartData = useMemo(() => {
    const fallback = liveProbability ?? 50;
    const sampledPoints = sampleTrendPointsForChart(trendPoints, selectedTimeframe);

    if (sampledPoints.length <= 1) {
      return {
        values: [fallback, fallback, fallback, fallback, fallback],
        labels: ['--', '--', '--', '--', 'Now'],
      };
    }

    return {
      values: sampledPoints.map((point) => point.value),
      labels: sampledPoints.map((point, index) => formatTrendLabel(point.timestamp, selectedTimeframe, index)),
    };
  }, [liveProbability, selectedTimeframe, trendPoints]);

  const chartSeries = chartData.values;
  const chartLabels = chartData.labels;

  useEffect(() => {
    if (isCreateMode || marketID === null || Number.isNaN(marketID) || marketID <= 0) {
      return;
    }

    const unsubscribe = subscribeRealtime({
      channels: ['market.updated', 'portfolio.updated'],
      onEvent: (event, payload) => {
        if (event === 'portfolio.updated') {
          const portfolioPayload = payload as PortfolioUpdatedPayload;
          if (portfolioPayload.userId !== String(userData?.id ?? '')) {
            return;
          }

          setBalanceFromSnapshot(portfolioPayload.balance);
          void loadUserPosition();
          return;
        }

        if (event !== 'market.updated') {
          return;
        }

        const marketPayload = payload as MarketUpdatedPayload;
        if (marketPayload.marketId !== marketID) {
          return;
        }

        const nextValue = Number(marketPayload.probability);
        if (Number.isFinite(nextValue)) {
          const normalizedValue = Math.max(0, Math.min(100, Number(nextValue.toFixed(2))));
          const nextTimestamp = (() => {
            const parsed = new Date(marketPayload.updatedAt).getTime();
            return Number.isNaN(parsed) ? Date.now() : parsed;
          })();

          if (!selectedOptionId || marketPayload.optionId === selectedOptionId) {
            setTrendPoints((prev) => {
              if (!prev.length) {
                return [{ value: normalizedValue, timestamp: nextTimestamp }];
              }

              const lastPoint = prev[prev.length - 1];
              if (Math.abs(lastPoint.value - normalizedValue) < 0.01) {
                return prev;
              }

              return [...prev, { value: normalizedValue, timestamp: nextTimestamp }].slice(-MAX_TREND_POINTS);
            });
          }

          setPrediction((prev) => {
            if (!prev?.options?.length) {
              return prev;
            }

            const updatedOptions = prev.options.map((option) => {
              if (option.id !== marketPayload.optionId) {
                return option;
              }

              return {
                ...option,
                probability: normalizedValue,
              };
            });

            return {
              ...prev,
              options: updatedOptions,
            };
          });
        }
      },
      onReconnect: () => {
        void loadMarketData();
        void loadUserPosition();
        void loadMarketHistory();
      },
    });

    return unsubscribe;
  }, [isCreateMode, loadMarketData, loadMarketHistory, loadUserPosition, marketID, selectedOptionId, setBalanceFromSnapshot, userData?.id]);

  const handlePostComment = useCallback(async () => {
    if (marketID === null || Number.isNaN(marketID) || marketID <= 0) {
      return;
    }

    if (commentSubmitting) {
      return;
    }

    const normalizedContent = sanitizeDisplayText(commentInput);
    if (!normalizedContent) {
      Alert.alert('Comment required', 'Write a short comment before posting.');
      return;
    }

    setCommentSubmitting(true);
    setCommentSubmissionState(null);
    const { ok, data } = await api.createComment(marketID, normalizedContent);
    setCommentSubmitting(false);

    if (!ok) {
      setCommentSubmissionState({
        type: 'error',
        message: toSafeMessage(data?.error, 'Unable to post your comment right now.'),
      });
      return;
    }

    setCommentInput('');
    setCommentSubmissionState({ type: 'success', message: 'Comment posted.' });
    await loadComments();
  }, [commentInput, commentSubmitting, loadComments, marketID]);

  if (isCreateMode) {
    return (
      <View className="flex-1" style={{ backgroundColor: ExploreTheme.pageBg }}>
        <SafeAreaView edges={['top']} className="bg-white">
          <View
            className="bg-white"
            style={{
              borderBottomWidth: 1,
              borderBottomColor: ExploreTheme.headerBorder,
              paddingHorizontal: 20,
              paddingVertical: 14,
            }}
          >
            <MarketDetailsHeader title="Create Market" />
          </View>
        </SafeAreaView>

        <ScrollView className="px-5 py-4" contentContainerStyle={{ paddingBottom: 28 }}>
          <Text className="font-grotesk-bold text-[24px] mb-2" style={{ color: ExploreTheme.titleText }}>
            Submit New Market
          </Text>
          <Text className="font-jetbrain text-[13px] mb-4" style={{ color: ExploreTheme.secondaryText }}>
            New markets are pending until admin approval and will not appear publicly until approved.
          </Text>

          <View
            className="rounded-3xl p-4 mb-4"
            style={{
              backgroundColor: UI_COLORS.createMarket.cardBg,
              borderWidth: 1,
              borderColor: UI_COLORS.createMarket.cardBorder,
              ...UI_SHADOWS.soft,
            }}
          >
            <Text className="font-grotesk-bold text-[16px] mb-3" style={{ color: ExploreTheme.titleText }}>
              Market Basics
            </Text>
            <CreateMarketField
              label="TITLE"
              value={title}
              onChangeText={(value) => {
                setTitle(value);
                setCreateErrors((prev) => ({ ...prev, title: undefined }));
              }}
              placeholder="Will Bitcoin close above $100k this month?"
              helperText="Keep the title specific and time-bound."
              errorText={createErrors.title}
            />
            <CreateMarketField
              label="DESCRIPTION"
              value={description}
              onChangeText={(value) => {
                setDescription(value);
                setCreateErrors((prev) => ({ ...prev, description: undefined }));
              }}
              placeholder="Add context users need before they trade this market."
              multiline
              helperText="A clear description leads to cleaner trading decisions."
              errorText={createErrors.description}
            />
          </View>

          <View
            className="rounded-3xl p-4 mb-4"
            style={{
              backgroundColor: UI_COLORS.createMarket.cardBg,
              borderWidth: 1,
              borderColor: UI_COLORS.createMarket.cardBorder,
              ...UI_SHADOWS.soft,
            }}
          >
            <Text className="font-grotesk-bold text-[16px] mb-3" style={{ color: ExploreTheme.titleText }}>
              Category
            </Text>
            <CreateMarketChipGroup
              label="PICK A CATEGORY"
              options={CREATE_MARKET_CATEGORIES}
              selected={category}
              onSelect={(value) => {
                setCategory(value);
                setCreateErrors((prev) => ({ ...prev, category: undefined }));
              }}
            />
            {createErrors.category ? (
              <Text className="font-jetbrain text-[12px]" style={{ color: UI_COLORS.danger }}>
                {createErrors.category}
              </Text>
            ) : null}
          </View>

          <View
            className="rounded-3xl p-4 mb-4"
            style={{
              backgroundColor: UI_COLORS.createMarket.cardBg,
              borderWidth: 1,
              borderColor: UI_COLORS.createMarket.cardBorder,
              ...UI_SHADOWS.soft,
            }}
          >
            <Text className="font-grotesk-bold text-[16px] mb-3" style={{ color: ExploreTheme.titleText }}>
              Resolution
            </Text>
            <CreateMarketChipGroup
              label="QUICK DATE PRESETS"
              options={CREATE_DATE_PRESETS.map((preset) => preset.label)}
              selected={''}
              onSelect={(value) => {
                const selectedPreset = CREATE_DATE_PRESETS.find((preset) => preset.label === value);
                if (selectedPreset) {
                  applyDatePreset(selectedPreset.days);
                }
              }}
            />
            <CreateMarketField
              label="RESOLUTION DATE (ISO)"
              value={resolutionDate}
              onChangeText={(value) => {
                setResolutionDate(value);
                setCreateErrors((prev) => ({ ...prev, resolutionDate: undefined }));
              }}
              placeholder="2026-12-31T00:00:00.000Z"
              helperText="You can type an ISO date or tap a quick preset above."
              errorText={createErrors.resolutionDate}
            />

            <View
              className="rounded-2xl px-4 py-3"
              style={{ borderWidth: 1, borderColor: UI_COLORS.createMarket.fieldBorder, backgroundColor: UI_COLORS.surfaceSoft }}
            >
              <Text className="font-jetbrain text-[12px]" style={{ color: ExploreTheme.secondaryText }}>
                Outcome format
              </Text>
              <Text className="font-jetbrain-bold text-[13px] mt-1" style={{ color: ExploreTheme.titleText }}>
                Binary market (Yes / No)
              </Text>
            </View>
          </View>

          <TouchableOpacity
            disabled={submitLoading}
            onPress={handleCreateMarket}
            className="rounded-2xl py-3 items-center"
            style={{
              backgroundColor: submitLoading
                ? BUTTON_STATE_TOKENS.primary.disabledBackgroundColor
                : BUTTON_STATE_TOKENS.primary.backgroundColor,
            }}
          >
            <Text className="font-grotesk-bold text-[14px]" style={{ color: BUTTON_STATE_TOKENS.primary.textColor }}>
              {submitLoading ? 'Submitting...' : 'Submit For Review'}
            </Text>
          </TouchableOpacity>

          {submitMessage ? (
            <Text className="font-jetbrain text-[13px] mt-3" style={{ color: ExploreTheme.secondaryText }}>
              {submitMessage}
            </Text>
          ) : null}
          {submitError ? (
            <Text className="font-jetbrain text-[13px] mt-3" style={{ color: ExploreTheme.searchHint }}>
              {submitError}
            </Text>
          ) : null}
        </ScrollView>
      </View>
    );
  }


  return (
    <View className="flex-1" style={{ backgroundColor: ExploreTheme.pageBg }}>
      <SafeAreaView edges={['top']} className="bg-white">
          <View
            className="bg-white"
            style={{
              borderBottomWidth: 1,
              borderBottomColor: ExploreTheme.headerBorder,
              paddingHorizontal: 20,
              paddingVertical: 14,
            }}
          >
            <MarketDetailsHeader
              title={prediction ? prediction.title : 'Market details'}
            />
          </View>   
      </SafeAreaView>
      {marketLoading ? (
        <LoadingScreen />
      ) : prediction ? (
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 34 }}>
        <View className="px-4 pt-3">
          <MarketDetailBalance balanceOverride={tradeBalanceSnapshot} />
        </View>

        <View
          className="mx-4 mt-3 rounded-3xl p-4"
          style={{
            backgroundColor: UI_COLORS.surface,
            borderWidth: 1,
            borderColor: UI_COLORS.borderSoft,
            ...UI_SHADOWS.soft,
          }}
        >
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-3">
              <Text className="font-jetbrain text-[11px] tracking-widest" style={{ color: ExploreTheme.secondaryText }}>
                CURRENT PRICE
              </Text>
              <View className="flex-row items-end mt-1 gap-2">
                <Text className="font-grotesk-bold text-[40px] leading-[44px]" style={{ color: ExploreTheme.titleText }}>
                  {selectedProbability !== null ? `${selectedProbability.toFixed(0)}%` : '--'}
                </Text>
                <Text className="font-jetbrain text-[12px] mb-1" style={{ color: UI_COLORS.success }}>
                  {selectedOption ? formatOptionLabel(selectedOption.name) : 'No option selected'}
                </Text>
              </View>
            </View>

            <Text className="font-jetbrain text-[11px] mt-2" style={{ color: UI_COLORS.textMuted }}>
              {tradeLoading ? 'Submitting...' : formatRelativeTime(prediction.endDate)}
            </Text>
          </View>
        </View>

        <View className="mx-4 mt-3 flex-row items-center gap-2">
          <View
            className="rounded-full px-3 py-1"
            style={{ backgroundColor: UI_COLORS.surfaceSoft, borderWidth: 1, borderColor: UI_COLORS.borderSoft }}
          >
            <Text className="font-jetbrain text-[11px]" style={{ color: ExploreTheme.secondaryText }}>
              {prediction.category}
            </Text>
          </View>
          <View
            className="rounded-full px-3 py-1"
            style={{ backgroundColor: UI_COLORS.surfaceSoft, borderWidth: 1, borderColor: UI_COLORS.borderSoft }}
          >
            <Text className="font-jetbrain text-[11px]" style={{ color: ExploreTheme.secondaryText }}>
              {prediction.status}
            </Text>
          </View>
        </View>

        <View className="mx-4 mt-3 flex-row items-center gap-2">
          {TIMEFRAME_OPTIONS.map((option) => {
            const isActive = selectedTimeframe === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                disabled={chartLoading}
                onPress={() => {
                  if (selectedTimeframe === option.value) {
                    return;
                  }

                  setSelectedTimeframe(option.value);
                }}
                className="rounded-full px-3 py-1"
                style={{
                  borderWidth: 1,
                  borderColor: isActive ? BUTTON_STATE_TOKENS.active.borderColor : BUTTON_STATE_TOKENS.inactive.borderColor,
                  backgroundColor: isActive ? BUTTON_STATE_TOKENS.active.backgroundColor : BUTTON_STATE_TOKENS.inactive.backgroundColor,
                  opacity: chartLoading ? BUTTON_STATE_TOKENS.disabledOpacity : 1,
                }}
              >
                <Text
                  className="font-jetbrain text-[11px]"
                  style={{ color: isActive ? BUTTON_STATE_TOKENS.active.textColor : BUTTON_STATE_TOKENS.inactive.textColor }}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {chartError ? (
          <View className="mx-4 mt-2">
            <Text className="font-jetbrain text-[11px]" style={{ color: ExploreTheme.searchHint }}>
              {chartError}
            </Text>
          </View>
        ) : null}

        <View className="mt-3">
          <MarketDetailTrendChart values={chartSeries} labels={chartLabels} />
        </View>

        <View className="mt-7 mb-7 items-center justify-center">
          <Text className="font-jetbrain text-[11px] tracking-widest" style={{ color: ExploreTheme.secondaryText }}>
            IMPLIED PROBABILITY
          </Text>
          <Text className="font-grotesk-bold text-[56px] leading-[62px] mt-1" style={{ color: ExploreTheme.titleText }}>
            {impliedProbability !== null ? `${impliedProbability.toFixed(0)}%` : '--'}
          </Text>
          <Text className="font-jetbrain text-[11px] mt-1" style={{ color: UI_COLORS.textMuted }}>
            {leadingOption ? `Leading option: ${formatOptionLabel(leadingOption.name)}` : 'Leading option unavailable'}
          </Text>
        </View>

        <View className="mt-3">
          <MarketDetailSummary prediction={prediction} userPosition={userPosition} />
        </View>

        <View
          className="mx-4 mt-3 rounded-2xl p-4"
          style={{
            backgroundColor: UI_COLORS.surface,
            borderWidth: 1,
            borderColor: UI_COLORS.borderSoft,
            ...UI_SHADOWS.soft,
          }}
        >
          <View className="flex-row items-center justify-between mb-3">
            <Text className="font-grotesk-bold text-[16px]" style={{ color: ExploreTheme.titleText }}>
              Trade Desk
            </Text>
            <Text className="font-jetbrain text-[11px]" style={{ color: ExploreTheme.secondaryText }}>
              {tradeLoading ? 'Submitting...' : selectedOption ? formatOptionLabel(selectedOption.name) : 'Ready'}
            </Text>
          </View>

          <Text className="font-jetbrain text-[12px] mb-3" style={{ color: ExploreTheme.secondaryText }}>
            Select backend option below. Price and action update from selected option state.
          </Text>

          <View className="flex-row flex-wrap gap-2 mb-3">
            {tradeOptions.map((option, index) => {
              const isSelected = option.id === selectedOptionId;
              const probability = normalizeProbability(Number(option.probability)) * 100;
              return (
                <TouchableOpacity
                  key={option.id}
                  disabled={tradeLoading}
                  onPress={() => {
                    setSelectedOptionId(option.id);
                    setTradeMessage(null);
                    setTradeError(null);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${option.name}`}
                  accessibilityHint="Sets the market option for your next trade"
                  className="rounded-full px-3 py-2"
                  style={{
                    borderWidth: 1,
                    borderColor: isSelected ? BUTTON_STATE_TOKENS.active.borderColor : BUTTON_STATE_TOKENS.inactive.borderColor,
                    backgroundColor: isSelected ? BUTTON_STATE_TOKENS.active.backgroundColor : BUTTON_STATE_TOKENS.inactive.backgroundColor,
                    opacity: tradeLoading ? BUTTON_STATE_TOKENS.disabledOpacity : 1,
                  }}
                >
                  <Text
                    className="font-jetbrain-bold text-[12px]"
                    style={{ color: isSelected ? BUTTON_STATE_TOKENS.active.textColor : BUTTON_STATE_TOKENS.inactive.textColor }}
                  >
                    {`${formatOptionLabel(option.name)} ${probability.toFixed(0)}%`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TextInput
            value={shareInput}
            onChangeText={(value) => {
              setShareInput(value);
              setTradeMessage(null);
              setTradeError(null);
            }}
            editable={!tradeLoading}
            keyboardType="decimal-pad"
            placeholder="Shares"
            className="bg-white rounded-xl px-4 py-3 mb-3 font-jetbrain"
            style={{ borderWidth: 1, borderColor: ExploreTheme.headerBorder, color: ExploreTheme.titleText }}
          />

          <View className="flex-row gap-2 mb-3">
            {QUICK_SHARE_PRESETS.map((preset) => {
              const active = shareInput === preset;
              return (
                <TouchableOpacity
                  key={preset}
                  disabled={tradeLoading}
                  onPress={() => {
                    setShareInput(preset);
                    setTradeMessage(null);
                    setTradeError(null);
                  }}
                  className="rounded-full px-3 py-1"
                  style={{
                    borderWidth: 1,
                    borderColor: active ? BUTTON_STATE_TOKENS.active.borderColor : BUTTON_STATE_TOKENS.inactive.borderColor,
                    backgroundColor: active ? BUTTON_STATE_TOKENS.active.backgroundColor : BUTTON_STATE_TOKENS.inactive.backgroundColor,
                    opacity: tradeLoading ? BUTTON_STATE_TOKENS.disabledOpacity : 1,
                  }}
                >
                  <Text className="font-jetbrain text-[11px]" style={{ color: active ? BUTTON_STATE_TOKENS.active.textColor : ExploreTheme.secondaryText }}>
                    {preset} share{preset === '1' ? '' : 's'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View
            className="rounded-xl px-3 py-2 mb-3"
            style={{ backgroundColor: UI_COLORS.surfaceSoft, borderWidth: 1, borderColor: UI_COLORS.borderSoft }}
          >
            <Text className="font-jetbrain text-[11px]" style={{ color: ExploreTheme.secondaryText }}>
              Estimated cost
            </Text>
            <View className="flex-row items-center gap-2 mt-1">
              <Image
                source={require('../assets/app-icons/p-coin.png')}
                style={{ width: 16, height: 16 }}
                resizeMode="contain"
              />
              <Text className="font-jetbrain-bold text-[14px]" style={{ color: ExploreTheme.titleText }}>
                {estimatedCost !== null ? estimatedCost.toFixed(2) : 'Enter shares and pick option'}
              </Text>
            </View>
          </View>

          <View
            className="rounded-xl px-3 py-2 mb-3"
            style={{ backgroundColor: UI_COLORS.surfaceSoft, borderWidth: 1, borderColor: UI_COLORS.borderSoft }}
          >
            <Text className="font-jetbrain text-[11px]" style={{ color: ExploreTheme.secondaryText }}>
              Estimated winnings
            </Text>
            <View className="flex-row items-center gap-2 mt-1">
              <Image
                source={require('../assets/app-icons/p-coin.png')}
                style={{ width: 16, height: 16 }}
                resizeMode="contain"
              />
              <Text className="font-jetbrain-bold text-[14px]" style={{ color: UI_COLORS.success }}>
                {estimatedWinnings !== null ? `+${estimatedWinnings.toFixed(2)}` : 'Enter shares and pick option'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            disabled={tradeLoading || !hasValidShares || !selectedOptionId}
            onPress={() => {
              void handleBuyTrade();
            }}
            accessibilityRole="button"
            accessibilityLabel={tradeActionLabel}
            accessibilityHint="Submits a buy order for the selected option"
            className="rounded-xl py-3 items-center"
            style={{
              backgroundColor:
                tradeLoading || !hasValidShares || !selectedOptionId
                  ? BUTTON_STATE_TOKENS.success.disabledBackgroundColor
                  : BUTTON_STATE_TOKENS.success.backgroundColor,
              opacity: tradeLoading || !hasValidShares || !selectedOptionId ? BUTTON_STATE_TOKENS.disabledOpacity : 1,
            }}
          >
            <Text className="font-grotesk-bold text-[14px]" style={{ color: BUTTON_STATE_TOKENS.success.textColor }}>
              {tradeLoading ? 'Processing buy...' : tradeActionLabel}
            </Text>
          </TouchableOpacity>

          {tradeMessage ? (
            <Text className="font-jetbrain text-[12px] mt-3" style={{ color: ExploreTheme.secondaryText }}>
              {tradeMessage}
            </Text>
          ) : null}
          {tradeError ? (
            <Text className="font-jetbrain text-[12px] mt-3" style={{ color: ExploreTheme.searchHint }}>
              {tradeError}
            </Text>
          ) : null}
        </View>

        <View
          className="mx-4 mt-3 rounded-2xl p-4"
          style={{
            backgroundColor: UI_COLORS.surface,
            borderWidth: 1,
            borderColor: UI_COLORS.borderSoft,
            ...UI_SHADOWS.soft,
          }}
        >
          <Text className="font-grotesk-bold text-[16px] mb-2" style={{ color: ExploreTheme.titleText, fontSize: UI_TYPE_SCALE.marketDetails.sectionTitle }}>
            Recent Activity
          </Text>
          <TextInput
            value={commentInput}
            onChangeText={(value) => {
              setCommentInput(value);
              if (commentSubmissionState?.type === 'error') {
                setCommentSubmissionState(null);
              }
            }}
            placeholder="Share your take..."
            multiline
            maxLength={280}
            className="bg-white rounded-xl px-4 py-3 mb-3 font-jetbrain"
            style={{ borderWidth: 1, borderColor: ExploreTheme.headerBorder, color: ExploreTheme.titleText, minHeight: 84 }}
          />
          <TouchableOpacity
            disabled={commentSubmitting}
            onPress={handlePostComment}
            accessibilityRole="button"
            accessibilityLabel="Post comment"
            accessibilityHint="Publishes your comment to this market discussion"
            className="rounded-xl py-3 items-center mb-3"
            style={{
              backgroundColor: commentSubmitting
                ? BUTTON_STATE_TOKENS.primary.disabledBackgroundColor
                : BUTTON_STATE_TOKENS.primary.backgroundColor,
            }}
          >
            <Text className="font-grotesk-bold text-[14px]" style={{ color: BUTTON_STATE_TOKENS.primary.textColor }}>
              {commentSubmitting ? 'Posting...' : 'Post Comment'}
            </Text>
          </TouchableOpacity>

          {commentSubmissionState ? (
            <Text
              className="font-jetbrain text-[12px] mb-3"
              style={{
                color:
                  commentSubmissionState.type === 'error'
                    ? ExploreTheme.searchHint
                    : ExploreTheme.secondaryText,
              }}
            >
              {commentSubmissionState.message}
            </Text>
          ) : null}

          {commentSubmissionState?.type === 'error' ? (
            <TouchableOpacity
              disabled={commentSubmitting || !sanitizeDisplayText(commentInput)}
              onPress={handlePostComment}
              accessibilityRole="button"
              accessibilityLabel="Retry posting comment"
              accessibilityHint="Attempts to post your comment again"
              className="rounded-xl py-2 items-center mb-3"
              style={{
                borderWidth: 1,
                borderColor: BUTTON_STATE_TOKENS.inactive.borderColor,
                backgroundColor: BUTTON_STATE_TOKENS.inactive.backgroundColor,
                opacity: commentSubmitting || !sanitizeDisplayText(commentInput) ? BUTTON_STATE_TOKENS.disabledOpacity : 1,
              }}
            >
              <Text className="font-jetbrain text-[12px]" style={{ color: BUTTON_STATE_TOKENS.inactive.textColor, fontSize: UI_TYPE_SCALE.marketDetails.helper }}>
                Retry posting comment
              </Text>
            </TouchableOpacity>
          ) : null}

          {commentsLoading ? (
              <Text className="font-jetbrain text-[12px]" style={{ color: ExploreTheme.secondaryText, fontSize: UI_TYPE_SCALE.marketDetails.helper }}>
              Loading comments. This should only take a moment.
            </Text>
          ) : commentsError ? (
            <EmptyState
              icon="error-outline"
              title="Could not load comments"
              description={`${commentsError} Please try again.`}
              actionLabel="Retry loading comments"
              onAction={() => {
                void loadComments();
              }}
            />
          ) : comments.length === 0 ? (
            <EmptyState
              icon="forum"
              title="No comments yet"
              description="Start the conversation with your first take."
            />
          ) : (
            comments.map((item) => (
              <View key={item.id} className="mb-3 rounded-xl p-3" style={{ backgroundColor: UI_COLORS.surfaceSoft, borderWidth: 1, borderColor: UI_COLORS.borderSoft }}>
                <View className="flex-row items-center justify-between mb-1">
                  <View className="flex-row items-center gap-2">
                    <View
                      className="w-6 h-6 rounded-full items-center justify-center"
                      style={{ backgroundColor: UI_COLORS.accentSoft }}
                    >
                      <Text className="font-jetbrain-bold text-[10px]" style={{ color: ExploreTheme.titleText }}>
                        {(sanitizeDisplayText(item.user_id) || 'A').charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View>
                      <Text className="font-jetbrain text-[11px]" style={{ color: ExploreTheme.secondaryText, fontSize: UI_TYPE_SCALE.marketDetails.commentMeta }}>
                        {sanitizeDisplayText(item.user_id) || 'Anonymous'}
                      </Text>
                      <Text className="font-jetbrain text-[10px]" style={{ color: UI_COLORS.textMuted, fontSize: UI_TYPE_SCALE.marketDetails.commentBadge }}>
                        Market comment
                      </Text>
                    </View>
                  </View>
                  <View
                    className="rounded-full px-2 py-1"
                    style={{ backgroundColor: UI_COLORS.surface, borderWidth: 1, borderColor: UI_COLORS.borderSoft }}
                  >
                    <Text className="font-jetbrain text-[10px]" style={{ color: UI_COLORS.textMuted, fontSize: UI_TYPE_SCALE.marketDetails.commentBadge }}>
                      {formatRelativeTime(item.created_at)}
                    </Text>
                  </View>
                </View>
                <Text className="font-jetbrain text-[13px]" style={{ color: ExploreTheme.titleText, fontSize: UI_TYPE_SCALE.marketDetails.commentBody, lineHeight: 18 }}>
                  {sanitizeDisplayText(item.content)}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
      ) : (
        <View className="flex-1 px-4 pt-6">
          <EmptyState
            icon="error-outline"
            title={hasInvalidMarketId ? 'Invalid market link' : 'Market unavailable'}
            description={marketError ?? 'We could not load this market right now.'}
            actionLabel="Retry loading market"
            onAction={() => {
              void loadMarketData();
            }}
          />
        </View>
      )}
    </View>
  )
}
