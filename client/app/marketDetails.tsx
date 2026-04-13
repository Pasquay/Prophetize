import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState, useCallback } from 'react';
import { Text, View, Alert, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as api from '../utils/api';
import {Prediction} from "../.expo/types/model";
import LoadingScreen from '@/components/common/loading-screen';
import MarketDetailsHeader from "@/components/market/market-detail-header";
import MarketDetailBalance from "@/components/market/market-detail-balance";
import MarketDetailSummary from "@/components/market/market-detail-summary";
import { ExploreTheme } from "../constants/explore-theme";
import { useUserStore } from '@/context/useUserStore';
import { UI_COLORS } from '@/constants/ui-tokens';
import { EmptyState } from '@/components/common/empty-state';

const CREATE_MARKET_CATEGORIES = ['SPORTS', 'CRYPTO', 'POLITICS', 'CULTURE', 'TECHNOLOGY'];
type CreateFieldKey = 'title' | 'description' | 'category' | 'resolutionDate' | 'options';

type CommentSubmissionState =
  | { type: 'success'; message: string }
  | { type: 'error'; message: string }
  | null;

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


export default function DetailsScreen() {
  const { id, mode } = useLocalSearchParams<{ id?: string; mode?: string }>();
  const marketID = id ? Number(id) : null;
  const isCreateMode = mode === 'create' || !id;

  const [marketLoading, setMarketLoading] = useState(true);
  const [prediction, setPrediction] = useState<Prediction>();
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

  const { fetchUserData, setBalanceFromSnapshot } = useUserStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('SPORTS');
  const [resolutionDate, setResolutionDate] = useState('');
  const [optionOne, setOptionOne] = useState('Yes');
  const [optionTwo, setOptionTwo] = useState('No');
  const [createErrors, setCreateErrors] = useState<Partial<Record<CreateFieldKey, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (isCreateMode || marketID === null || Number.isNaN(marketID)) {
      setMarketLoading(false);
      return;
    }

    const getMarketData = async (marketID:number) => {
        setMarketLoading(true);
        const {ok, data} = await api.get("/markets/"+marketID);
        if(ok){
            setPrediction(data?.data ?? null);
        } else {
            Alert.alert('Something wrong happened when fetching for predictions!');
        }
        setMarketLoading(false);
      };
      getMarketData(marketID); 
    }, [isCreateMode, marketID]);

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

    setSelectedOptionId(prediction.options[0].id);
  }, [prediction]);

  const loadComments = useCallback(async () => {
    if (!marketID || Number.isNaN(marketID)) {
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

      setComments(normalizedComments);
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

  const validateCreateForm = useCallback(() => {
    const normalizedCategory = category.trim().toUpperCase();
    const optionValues = [optionOne.trim(), optionTwo.trim()].filter(Boolean);
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

    if (optionValues.length < 2) {
      nextErrors.options = 'Please provide at least two options.';
    }

    setCreateErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return null;
    }

    return {
      normalizedCategory,
      parsedDate,
      optionValues,
    };
  }, [category, description, optionOne, optionTwo, resolutionDate, title]);

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
    setOptionOne('Yes');
    setOptionTwo('No');
    setCreateErrors({});
    setSubmitError(null);
  }, [title, description, validateCreateForm]);

  const handleTrade = useCallback(async (side: 'buy' | 'sell') => {
    if (!prediction) {
      return;
    }

    if (tradeLoading) {
      return;
    }

    if (!selectedOptionId) {
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
      const tradeFn = side === 'buy' ? api.buyShares : api.sellShares;
      const { ok, data } = await tradeFn({
        optionId: selectedOptionId,
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
      await fetchUserData();
      setTradeBalanceSnapshot(null);
    } catch {
      setTradeError('Trade completed, but account refresh is delayed. Pull to refresh and try again.');
    } finally {
      setTradeLoading(false);
    }
  }, [prediction, tradeLoading, selectedOptionId, shareInput, setBalanceFromSnapshot, fetchUserData]);

  const parsedShares = Number(shareInput);
  const hasValidShares = Number.isFinite(parsedShares) && parsedShares > 0;

  const handlePostComment = useCallback(async () => {
    if (!marketID || Number.isNaN(marketID)) {
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

        <ScrollView className="px-5 py-4">
          <Text className="font-grotesk-bold text-[22px] mb-2" style={{ color: ExploreTheme.titleText }}>
            Submit New Market
          </Text>
          <Text className="font-jetbrain text-[13px] mb-4" style={{ color: ExploreTheme.secondaryText }}>
            New markets are pending until admin approval and will not appear publicly until approved.
          </Text>

          <TextInput
            value={title}
            onChangeText={(value) => {
              setTitle(value);
              setCreateErrors((prev) => ({ ...prev, title: undefined }));
            }}
            placeholder="Title"
            className="bg-white rounded-xl px-4 py-3 mb-3 font-jetbrain"
            style={{ borderWidth: 1, borderColor: ExploreTheme.headerBorder, color: ExploreTheme.titleText }}
          />
          {createErrors.title ? (
            <Text className="font-jetbrain text-[12px] mt-[-8px] mb-3" style={{ color: ExploreTheme.searchHint }}>
              {createErrors.title}
            </Text>
          ) : null}
          <TextInput
            value={description}
            onChangeText={(value) => {
              setDescription(value);
              setCreateErrors((prev) => ({ ...prev, description: undefined }));
            }}
            placeholder="Description"
            multiline
            className="bg-white rounded-xl px-4 py-3 mb-3 font-jetbrain"
            style={{ borderWidth: 1, borderColor: ExploreTheme.headerBorder, color: ExploreTheme.titleText, minHeight: 92 }}
          />
          {createErrors.description ? (
            <Text className="font-jetbrain text-[12px] mt-[-8px] mb-3" style={{ color: ExploreTheme.searchHint }}>
              {createErrors.description}
            </Text>
          ) : null}
          <TextInput
            value={category}
            onChangeText={(value) => {
              setCategory(value);
              setCreateErrors((prev) => ({ ...prev, category: undefined }));
            }}
            placeholder={`Category (${CREATE_MARKET_CATEGORIES.join(', ')})`}
            autoCapitalize="characters"
            className="bg-white rounded-xl px-4 py-3 mb-3 font-jetbrain"
            style={{ borderWidth: 1, borderColor: ExploreTheme.headerBorder, color: ExploreTheme.titleText }}
          />
          {createErrors.category ? (
            <Text className="font-jetbrain text-[12px] mt-[-8px] mb-3" style={{ color: ExploreTheme.searchHint }}>
              {createErrors.category}
            </Text>
          ) : null}
          <TextInput
            value={resolutionDate}
            onChangeText={(value) => {
              setResolutionDate(value);
              setCreateErrors((prev) => ({ ...prev, resolutionDate: undefined }));
            }}
            placeholder="Resolution date (ISO)"
            className="bg-white rounded-xl px-4 py-3 mb-3 font-jetbrain"
            style={{ borderWidth: 1, borderColor: ExploreTheme.headerBorder, color: ExploreTheme.titleText }}
          />
          {createErrors.resolutionDate ? (
            <Text className="font-jetbrain text-[12px] mt-[-8px] mb-3" style={{ color: ExploreTheme.searchHint }}>
              {createErrors.resolutionDate}
            </Text>
          ) : null}
          <TextInput
            value={optionOne}
            onChangeText={(value) => {
              setOptionOne(value);
              setCreateErrors((prev) => ({ ...prev, options: undefined }));
            }}
            placeholder="Option 1"
            className="bg-white rounded-xl px-4 py-3 mb-3 font-jetbrain"
            style={{ borderWidth: 1, borderColor: ExploreTheme.headerBorder, color: ExploreTheme.titleText }}
          />
          <TextInput
            value={optionTwo}
            onChangeText={(value) => {
              setOptionTwo(value);
              setCreateErrors((prev) => ({ ...prev, options: undefined }));
            }}
            placeholder="Option 2"
            className="bg-white rounded-xl px-4 py-3 mb-4 font-jetbrain"
            style={{ borderWidth: 1, borderColor: ExploreTheme.headerBorder, color: ExploreTheme.titleText }}
          />
          {createErrors.options ? (
            <Text className="font-jetbrain text-[12px] mt-[-10px] mb-4" style={{ color: ExploreTheme.searchHint }}>
              {createErrors.options}
            </Text>
          ) : null}

          <TouchableOpacity
            disabled={submitLoading}
            onPress={handleCreateMarket}
            className="rounded-xl py-3 items-center"
            style={{ backgroundColor: submitLoading ? ExploreTheme.headerBorder : ExploreTheme.titleText }}
          >
            <Text className="font-grotesk-bold text-[14px]" style={{ color: '#FFFFFF' }}>
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
    <View className="flex-1 gap-2" style={{ backgroundColor: ExploreTheme.pageBg }}>
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
              title={prediction ? prediction.title : "undefined"}
            />
          </View>   
      </SafeAreaView>
      {marketLoading ? (
        <LoadingScreen />
      ) : prediction ? (
      <View>
        <MarketDetailBalance balanceOverride={tradeBalanceSnapshot} />
        <MarketDetailSummary prediction={prediction} userPosition={userPosition} />
        <View
          className="mx-4 mt-3 rounded-2xl p-4"
          style={{
            backgroundColor: UI_COLORS.surface,
            borderWidth: 1,
            borderColor: ExploreTheme.headerBorder,
          }}
        >
          <Text className="font-grotesk-bold text-[16px] mb-2" style={{ color: ExploreTheme.titleText }}>
            Trade
          </Text>
          <Text className="font-jetbrain text-[12px] mb-3" style={{ color: ExploreTheme.secondaryText }}>
            Select an option, enter shares, then buy or sell.
          </Text>

          <View className="flex-row flex-wrap gap-2 mb-3">
            {prediction.options.map((option) => {
              const isSelected = option.id === selectedOptionId;
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
                    borderColor: ExploreTheme.headerBorder,
                    backgroundColor: isSelected ? ExploreTheme.titleText : UI_COLORS.surface,
                    opacity: tradeLoading ? 0.6 : 1,
                  }}
                >
                  <Text
                    className="font-jetbrain text-[12px]"
                    style={{ color: isSelected ? UI_COLORS.surface : ExploreTheme.titleText }}
                  >
                    {option.name}
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

          <View className="flex-row gap-2">
            <TouchableOpacity
              disabled={tradeLoading || !hasValidShares || !selectedOptionId}
              onPress={() => handleTrade('buy')}
              accessibilityRole="button"
              accessibilityLabel="Buy shares"
              accessibilityHint="Submits a buy order for the selected option"
              className="flex-1 rounded-xl py-3 items-center"
              style={{ backgroundColor: tradeLoading ? ExploreTheme.headerBorder : UI_COLORS.success }}
            >
              <Text className="font-grotesk-bold text-[14px]" style={{ color: UI_COLORS.surface }}>
                {tradeLoading ? 'Processing...' : 'Buy'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={tradeLoading || !hasValidShares || !selectedOptionId}
              onPress={() => handleTrade('sell')}
              accessibilityRole="button"
              accessibilityLabel="Sell shares"
              accessibilityHint="Submits a sell order for the selected option"
              className="flex-1 rounded-xl py-3 items-center"
              style={{ backgroundColor: tradeLoading ? ExploreTheme.headerBorder : UI_COLORS.danger }}
            >
              <Text className="font-grotesk-bold text-[14px]" style={{ color: UI_COLORS.surface }}>
                {tradeLoading ? 'Processing...' : 'Sell'}
              </Text>
            </TouchableOpacity>
          </View>

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
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: ExploreTheme.headerBorder,
          }}
        >
          <Text className="font-grotesk-bold text-[16px] mb-2" style={{ color: ExploreTheme.titleText }}>
            Comments
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
            style={{ backgroundColor: commentSubmitting ? ExploreTheme.headerBorder : ExploreTheme.titleText }}
          >
            <Text className="font-grotesk-bold text-[14px]" style={{ color: UI_COLORS.surface }}>
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
                borderColor: ExploreTheme.headerBorder,
                backgroundColor: UI_COLORS.surface,
                opacity: commentSubmitting || !sanitizeDisplayText(commentInput) ? 0.6 : 1,
              }}
            >
              <Text className="font-jetbrain text-[12px]" style={{ color: ExploreTheme.titleText }}>
                Retry Post
              </Text>
            </TouchableOpacity>
          ) : null}

          {commentsLoading ? (
            <Text className="font-jetbrain text-[12px]" style={{ color: ExploreTheme.secondaryText }}>
              Loading comments. This should only take a moment.
            </Text>
          ) : commentsError ? (
            <EmptyState
              icon="error-outline"
              title="Could not load comments"
              description={`${commentsError} Please try again.`}
              actionLabel="Retry"
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
              <View key={item.id} className="mb-3 pb-3" style={{ borderBottomWidth: 1, borderBottomColor: ExploreTheme.headerBorder }}>
                <Text className="font-jetbrain text-[11px] mb-1" style={{ color: ExploreTheme.secondaryText }}>
                  {sanitizeDisplayText(item.user_id) || 'Anonymous'}
                </Text>
                <Text className="font-jetbrain text-[13px]" style={{ color: ExploreTheme.titleText }}>
                  {sanitizeDisplayText(item.content)}
                </Text>
              </View>
            ))
          )}
        </View>
      </View>
      ) : null}
    </View>
  )
}
