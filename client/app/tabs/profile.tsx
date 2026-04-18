import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, Alert, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { useAuth } from '../../context/AuthContext';
import { useUserStore } from '../../context/useUserStore';

import { UI_COLORS } from '@/constants/ui-tokens';
import { ExploreTheme } from '@/constants/explore-theme';
import * as api from '@/utils/api';

import { ProfileAvatar } from '@/components/profile/profile-avatar';
import { EmptyState } from '@/components/common/empty-state';

const CREATED_MARKET_OPENABLE_STATUSES = ['active', 'closed', 'resolving', 'disputed', 'finalized'];

const formatCurrency = (value: number) => {
  return `$${value.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`;
};

const formatDate = (value?: string | null) => {
  if (!value) {
    return '--';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '--';
  }

  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const statusColors = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return { bg: '#DFF7FE', border: '#82DAEF', text: '#007FA2' };
    case 'pending':
      return { bg: '#FFF5D9', border: '#F7D27B', text: '#8A5B00' };
    case 'rejected':
      return { bg: '#FEE2E2', border: '#FCA5A5', text: UI_COLORS.danger };
    case 'finalized':
    case 'closed':
      return { bg: '#E7F8F0', border: '#A5E2C2', text: UI_COLORS.success };
    default:
      return { bg: UI_COLORS.surfaceSoft, border: UI_COLORS.borderSoft, text: UI_COLORS.textSecondary };
  }
};

const getPayloadArray = (payload: unknown): Record<string, unknown>[] => {
  if (Array.isArray(payload)) {
    return payload.filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'));
  }

  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const record = payload as Record<string, unknown>;
  const nested = record.data;
  if (Array.isArray(nested)) {
    return nested.filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'));
  }

  return [];
};

const toActivityIcon = (type: string): keyof typeof MaterialIcons.glyphMap => {
  const normalized = type.toLowerCase();
  if (normalized === 'buy') return 'trending-up';
  if (normalized === 'sell') return 'trending-down';
  if (normalized === 'resolution') return 'how-to-vote';
  return 'timeline';
};

const toActivityLabel = (type: string) => {
  const normalized = type.toLowerCase();
  if (normalized === 'buy') return 'Bought';
  if (normalized === 'sell') return 'Sold';
  if (normalized === 'resolution') return 'Resolved';
  return 'Activity';
};

export default function ProfileScreen() {
  const router = useRouter();
  const { userId: routeUserId, initialFollowing } = useLocalSearchParams<{ userId?: string; initialFollowing?: string }>();
  const { logout, user } = useAuth();
  const { userData, fetchUserData } = useUserStore();
  const tabBarHeight = useBottomTabBarHeight();

  const [summary, setSummary] = useState<api.PortfolioSummary | null>(null);
  const [activities, setActivities] = useState<api.PortfolioActivityTransaction[]>([]);
  const [createdMarkets, setCreatedMarkets] = useState<api.CreatedMarketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(initialFollowing === '1');
  const [followLoading, setFollowLoading] = useState(false);
  const [followErrorMessage, setFollowErrorMessage] = useState<string | null>(null);

  const viewedUserId = typeof routeUserId === 'string' ? routeUserId.trim() : '';
  const isOwnProfile = !viewedUserId || viewedUserId === String(user?.id ?? '');

  useEffect(() => {
    if (isOwnProfile) {
      setIsFollowing(false);
      setFollowErrorMessage(null);
      return;
    }

    setIsFollowing(initialFollowing === '1');
    setFollowErrorMessage(null);
  }, [initialFollowing, isOwnProfile]);

  const fetchProfileData = useCallback(async () => {
    setLoadError(null);

    const summaryTask = isOwnProfile ? api.getPortfolioSummary() : Promise.resolve({ ok: true, data: null });
    const activityTask = isOwnProfile ? api.getPortfolioActivity() : Promise.resolve({ ok: true, data: [] });
    const createdTask = api.getCreatedMarkets({
      userId: isOwnProfile ? undefined : viewedUserId,
      limit: 6,
    });

    const [profileResult, summaryResult, activityResult, createdResult] = await Promise.all([
      fetchUserData(),
      summaryTask,
      activityTask,
      createdTask,
    ]);

    if (isOwnProfile && summaryResult.ok && summaryResult.data && typeof summaryResult.data === 'object') {
      setSummary(summaryResult.data as api.PortfolioSummary);
    } else if (isOwnProfile && !summaryResult.ok) {
      setLoadError('Unable to load profile summary right now.');
    } else {
      setSummary(null);
    }

    if (isOwnProfile && activityResult.ok) {
      const normalized = getPayloadArray(activityResult.data)
        .map((item) => ({
          id: String(item.id ?? ''),
          market_option_id: String(item.market_option_id ?? ''),
          type: String(item.type ?? ''),
          shares: Number(item.shares ?? 0),
          price_at_time: Number(item.price_at_time ?? 0),
          amount: Number(item.amount ?? 0),
          created_at: String(item.created_at ?? ''),
          option_name: String(item.option_name ?? ''),
          market_id: String(item.market_id ?? ''),
          market_title: String(item.market_title ?? ''),
        }))
        .filter((item) => item.id && item.market_title)
        .slice(0, 6);

      setActivities(normalized);
    } else if (!isOwnProfile) {
      setActivities([]);
    }

    if (createdResult.ok) {
      const normalized = api.normalizeCreatedMarketsPayload(createdResult.data);

      setCreatedMarkets(normalized);
    } else {
      setCreatedMarkets([]);
      setLoadError((current) => current ?? 'Unable to load created markets right now.');
    }

    if (!profileResult && isOwnProfile) {
      setLoadError((current) => current ?? 'Unable to refresh account data.');
    }
  }, [fetchUserData, isOwnProfile, viewedUserId]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      await fetchProfileData();
      setLoading(false);
    };

    void run();
  }, [fetchProfileData]);

  useFocusEffect(
    useCallback(() => {
      if (loading || refreshing) {
        return;
      }

      void fetchProfileData();
    }, [fetchProfileData, loading, refreshing])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await fetchProfileData();
    setRefreshing(false);
  }, [fetchProfileData]);

  const handleFollowToggle = useCallback(async () => {
    if (isOwnProfile || !viewedUserId || followLoading) {
      return;
    }

    const previous = isFollowing;
    const action: api.FollowAction = previous ? 'unfollow' : 'follow';
    setIsFollowing(!previous);
    setFollowErrorMessage(null);
    setFollowLoading(true);

    const { ok, data } = await api.followUser(viewedUserId, action);
    setFollowLoading(false);

    if (!ok) {
      setIsFollowing(previous);
      const message = typeof data?.error === 'string' && data.error.trim()
        ? data.error.trim()
        : 'Unable to update follow status.';
      setFollowErrorMessage(message);
      Alert.alert('Follow action failed', message);
      return;
    }

    setIsFollowing(Boolean(data?.relationship?.following));
  }, [followLoading, isFollowing, isOwnProfile, viewedUserId]);

  const handleLogout = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/');
          },
        },
      ]
    );
  };

  const displayName = isOwnProfile
    ? (summary?.username || user?.username || 'You')
    : `Trader ${viewedUserId.slice(0, 6)}`;

  const joinedLabel = isOwnProfile
    ? formatDate(summary?.joined || user?.created_at || null)
    : null;

  const netWorthValue = summary?.net_worth ?? (userData?.balance || 0);
  const balanceValue = summary?.balance ?? (userData?.balance || 0);
  const positionsValue = summary?.positions_value ?? 0;
  const predictionsCount = summary?.predictions_count ?? 0;
  const biggestWin = summary?.biggest_win ?? 0;

  if (loading) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: UI_COLORS.pageBg }}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-base font-jetbrain" style={{ color: UI_COLORS.textSecondary }}>
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: UI_COLORS.pageBg }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={UI_COLORS.accent}
          />
        }
        contentContainerStyle={{ paddingBottom: tabBarHeight + 24 }}
      >
        <View className="px-5 pt-4">
          <View className="rounded-3xl overflow-hidden" style={{ borderWidth: 1, borderColor: UI_COLORS.accentBorder, backgroundColor: UI_COLORS.surface }}>
            <View className="px-4 py-3" style={{ backgroundColor: UI_COLORS.accentSoft }}>
              <Text className="font-jetbrain text-[11px] tracking-widest" style={{ color: UI_COLORS.linkPressed }}>
                CREATOR PROFILE
              </Text>
            </View>

            <View className="p-4">
              <View className="flex-row items-center">
                <ProfileAvatar
                  imageUrl={summary?.avatar_url || user?.avatar_url}
                  username={displayName}
                  size="md"
                  editable={false}
                />
                <View className="ml-3 flex-1">
                  <Text className="font-grotesk-bold text-[24px]" style={{ color: UI_COLORS.textPrimary }}>
                    {displayName}
                  </Text>
                  {joinedLabel ? (
                    <Text className="font-jetbrain text-[12px] mt-1" style={{ color: UI_COLORS.textSecondary }}>
                      Joined {joinedLabel}
                    </Text>
                  ) : null}
                </View>
              </View>

              <View className="flex-row mt-4 gap-2">
                <View className="rounded-2xl px-3 py-2 flex-1" style={{ backgroundColor: '#DDF8FF', borderWidth: 1, borderColor: '#89DEEF' }}>
                  <Text className="font-jetbrain text-[10px]" style={{ color: '#146A82' }}>NET WORTH</Text>
                  <Text className="font-grotesk-bold text-[17px] mt-1" style={{ color: '#0B1F2A' }}>
                    {formatCurrency(netWorthValue)}
                  </Text>
                </View>
                <View className="rounded-2xl px-3 py-2 flex-1" style={{ backgroundColor: '#EEF6FA', borderWidth: 1, borderColor: '#D0E5EE' }}>
                  <Text className="font-jetbrain text-[10px]" style={{ color: UI_COLORS.textSecondary }}>BALANCE</Text>
                  <Text className="font-grotesk-bold text-[17px] mt-1" style={{ color: UI_COLORS.textPrimary }}>
                    {formatCurrency(balanceValue)}
                  </Text>
                </View>
              </View>

              {!isOwnProfile ? (
                <View className="mt-3 items-start">
                  <Pressable
                    onPress={() => {
                      void handleFollowToggle();
                    }}
                    disabled={followLoading}
                    className="px-4 py-2 rounded-full"
                    style={{
                      backgroundColor: isFollowing ? UI_COLORS.textMuted : UI_COLORS.success,
                      opacity: followLoading ? 0.7 : 1,
                    }}
                  >
                    <Text className="font-jetbrain-bold text-[12px]" style={{ color: UI_COLORS.surface }}>
                      {followLoading ? 'Updating...' : isFollowing ? 'Following' : 'Follow'}
                    </Text>
                  </Pressable>
                  {followErrorMessage ? (
                    <Text className="font-jetbrain text-[11px] mt-2" style={{ color: ExploreTheme.searchHint }}>
                      {followErrorMessage}
                    </Text>
                  ) : null}
                </View>
              ) : null}
            </View>
          </View>
        </View>

        {loadError ? (
          <View className="px-5 mt-3">
            <Text className="font-jetbrain text-[12px]" style={{ color: ExploreTheme.searchHint }}>
              {loadError}
            </Text>
          </View>
        ) : null}

        {isOwnProfile ? (
          <View className="px-5 mt-4">
            <View className="flex-row gap-2">
              <View className="flex-1 rounded-2xl p-3" style={{ backgroundColor: UI_COLORS.surface, borderWidth: 1, borderColor: UI_COLORS.accentBorder }}>
                <Text className="font-jetbrain text-[10px]" style={{ color: UI_COLORS.textSecondary }}>PREDICTIONS</Text>
                <Text className="font-grotesk-bold text-[20px] mt-1" style={{ color: UI_COLORS.textPrimary }}>{predictionsCount}</Text>
              </View>
              <View className="flex-1 rounded-2xl p-3" style={{ backgroundColor: UI_COLORS.surface, borderWidth: 1, borderColor: UI_COLORS.borderSoft }}>
                <Text className="font-jetbrain text-[10px]" style={{ color: UI_COLORS.textSecondary }}>OPEN VALUE</Text>
                <Text className="font-grotesk-bold text-[20px] mt-1" style={{ color: UI_COLORS.textPrimary }}>{formatCurrency(positionsValue)}</Text>
              </View>
              <View className="flex-1 rounded-2xl p-3" style={{ backgroundColor: '#FDF3E0', borderWidth: 1, borderColor: '#F5D59A' }}>
                <Text className="font-jetbrain text-[10px]" style={{ color: '#8A5B00' }}>BIGGEST WIN</Text>
                <Text className="font-grotesk-bold text-[20px] mt-1" style={{ color: '#553600' }}>{formatCurrency(biggestWin)}</Text>
              </View>
            </View>
          </View>
        ) : null}

        <View className="px-5 mt-5">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="font-grotesk-bold text-[19px]" style={{ color: ExploreTheme.titleText }}>
              {isOwnProfile ? 'Your Created Markets' : 'Created Markets'}
            </Text>
            <Text className="font-jetbrain text-[11px]" style={{ color: UI_COLORS.textSecondary }}>
              {createdMarkets.length} total
            </Text>
          </View>

          <View className="rounded-2xl overflow-hidden" style={{ backgroundColor: UI_COLORS.surface, borderWidth: 1, borderColor: UI_COLORS.borderSoft }}>
            {createdMarkets.length === 0 ? (
              <EmptyState
                icon="storefront"
                title="No created markets yet"
                description={isOwnProfile ? 'Create your first market to see it here.' : 'No public market creations to show.'}
                compact
              />
            ) : (
              createdMarkets.map((market, index) => {
                const canOpen = CREATED_MARKET_OPENABLE_STATUSES.includes(market.status.toLowerCase());
                const colors = statusColors(market.status);
                return (
                  <View key={market.id}>
                    <View className="px-4 py-3">
                      <View className="flex-row items-start justify-between">
                        <View className="flex-1 pr-3">
                          <Text className="font-grotesk-bold text-[15px]" style={{ color: UI_COLORS.textPrimary }}>
                            {market.title}
                          </Text>
                          <Text className="font-jetbrain text-[11px] mt-1" style={{ color: UI_COLORS.textSecondary }}>
                            {market.category} • Resolves {formatDate(market.endDate)}
                          </Text>
                        </View>
                        <View className="rounded-full px-2 py-1" style={{ backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border }}>
                          <Text className="font-jetbrain text-[10px]" style={{ color: colors.text }}>
                            {market.status.toUpperCase()}
                          </Text>
                        </View>
                      </View>

                      <View className="flex-row items-center justify-between mt-3">
                        <Text className="font-jetbrain text-[11px]" style={{ color: UI_COLORS.textSecondary }}>
                          Volume {formatCurrency(market.totalVolume)}
                        </Text>
                        {canOpen ? (
                          <Pressable
                            onPress={() => {
                              router.push({ pathname: '/marketDetails', params: { id: String(market.id) } });
                            }}
                            className="rounded-full px-3 py-1"
                            style={{ backgroundColor: UI_COLORS.accentSoft, borderWidth: 1, borderColor: UI_COLORS.accentBorder }}
                          >
                            <Text className="font-jetbrain text-[11px]" style={{ color: UI_COLORS.linkPressed }}>
                              Open
                            </Text>
                          </Pressable>
                        ) : (
                          <Text className="font-jetbrain text-[11px]" style={{ color: UI_COLORS.textMuted }}>
                            Not public yet
                          </Text>
                        )}
                      </View>
                    </View>
                    {index < createdMarkets.length - 1 ? (
                      <View className="h-[1px] ml-4" style={{ backgroundColor: UI_COLORS.borderSoft }} />
                    ) : null}
                  </View>
                );
              })
            )}
          </View>
        </View>

        {isOwnProfile ? (
          <View className="px-5 mt-5">
            <Text className="font-grotesk-bold text-[19px] mb-3" style={{ color: ExploreTheme.titleText }}>
              Recent Activity
            </Text>
            <View className="rounded-2xl overflow-hidden" style={{ backgroundColor: UI_COLORS.surface, borderWidth: 1, borderColor: UI_COLORS.borderSoft }}>
              {activities.length === 0 ? (
                <EmptyState
                  icon="history"
                  title="No activity yet"
                  description="Your trades and resolutions will appear here."
                  compact
                />
              ) : (
                activities.map((activity, index) => {
                  const amount = Number(activity.amount) || 0;
                  const isPositive = amount >= 0;
                  const signedAmount = `${isPositive ? '+' : '-'}${formatCurrency(Math.abs(amount))}`;
                  const icon = toActivityIcon(activity.type);
                  const label = toActivityLabel(activity.type);

                  return (
                    <View key={activity.id}>
                      <View className="px-4 py-3 flex-row">
                        <View className="w-9 h-9 rounded-full items-center justify-center mr-3" style={{ backgroundColor: UI_COLORS.accentSoft }}>
                          <MaterialIcons name={icon} size={18} color={UI_COLORS.linkPressed} />
                        </View>

                        <View className="flex-1">
                          <View className="flex-row items-start justify-between">
                            <View className="flex-1 pr-2">
                              <Text className="font-grotesk-bold text-[14px]" style={{ color: UI_COLORS.textPrimary }}>
                                {activity.market_title}
                              </Text>
                              <Text className="font-jetbrain text-[11px] mt-1" style={{ color: UI_COLORS.textSecondary }}>
                                {label} • {formatDate(activity.created_at)}
                              </Text>
                            </View>
                            <Text className="font-grotesk-bold text-[14px]" style={{ color: isPositive ? UI_COLORS.success : UI_COLORS.danger }}>
                              {signedAmount}
                            </Text>
                          </View>
                        </View>
                      </View>
                      {index < activities.length - 1 ? (
                        <View className="h-[1px] ml-4" style={{ backgroundColor: UI_COLORS.borderSoft }} />
                      ) : null}
                    </View>
                  );
                })
              )}
            </View>
          </View>
        ) : null}

        {isOwnProfile ? (
          <View className="px-5 mt-5 mb-2">
            <Pressable
              onPress={handleLogout}
              className="rounded-2xl py-3 items-center"
              style={{ backgroundColor: UI_COLORS.surface, borderWidth: 1, borderColor: '#FECACA' }}
            >
              <Text className="font-grotesk-bold text-[14px]" style={{ color: UI_COLORS.danger }}>
                Log Out
              </Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
