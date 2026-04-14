import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, Alert, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { useAuth } from '../../context/AuthContext';
import { useUserStore } from '../../context/useUserStore';

import { UI_COLORS } from '@/constants/ui-tokens';
import { ExploreTheme } from '@/constants/explore-theme';
import * as api from '@/utils/api';

import { ProfileAvatar } from '@/components/profile/profile-avatar';

import { StatCard } from '@/components/profile/stat-card';
import { ActivityItem } from '@/components/profile/activity-item';
import { SettingsItem } from '@/components/profile/settings-item';
import { EmptyState } from '@/components/common/empty-state';

type UserStats = {
  winRate: number;
  predictions: number;
  rank: number;
  topPercent?: number;
};

type Activity = {
  id: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  result: 'won' | 'lost' | 'pending';
  amount: string;
  roi: string;
  date: string;
};

export default function ProfileScreen() {
  const router = useRouter();
  const { userId: routeUserId, initialFollowing } = useLocalSearchParams<{ userId?: string; initialFollowing?: string }>();
  const { logout, user } = useAuth();
  const { userData, fetchUserData } = useUserStore();
  const tabBarHeight = useBottomTabBarHeight();

  const [stats, setStats] = useState<UserStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
  }, [initialFollowing, isOwnProfile, viewedUserId]);

  const fetchStats = useCallback(async () => {
    try {
      // TODO: Replace with actual stats endpoint
      // const { ok, data } = await api.get('/users/stats');
      // if (ok) setStats(data);
      
      // Mock data for now
      setStats({
        winRate: 68,
        predictions: 142,
        rank: 23,
        topPercent: 5,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  const fetchActivities = useCallback(async () => {
    try {
      // TODO: Replace with actual activity endpoint
      // const { ok, data } = await api.get('/users/activity?limit=5');
      // if (ok) setActivities(data);
      
      // Mock data for now
      setActivities([
        {
          id: '1',
          icon: 'attach-money',
          title: 'Bitcoin > $100k by Q4',
          result: 'won',
          amount: '+500.00',
          roi: '125% ROI',
          date: 'Oct 24, 2023',
        },
        {
          id: '2',
          icon: 'computer',
          title: 'SpaceX Launch Success',
          result: 'lost',
          amount: '-200.00',
          roi: '0% ROI',
          date: 'Oct 22, 2023',
        },
        {
          id: '3',
          icon: 'sports-basketball',
          title: 'Miami vs Kansas City',
          result: 'won',
          amount: '+120.50',
          roi: '18% ROI',
          date: 'Oct 18, 2023',
        },
      ]);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    }
  }, []);

  const fetchProfileData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([fetchUserData(), fetchStats(), fetchActivities()]);
    } finally {
      setLoading(false);
    }
  }, [fetchUserData, fetchStats, fetchActivities]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

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

  const handleEditProfile = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Edit Profile', 'Coming soon!');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: UI_COLORS.pageBg }}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-base font-inter" style={{ color: UI_COLORS.textSecondary }}>
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: UI_COLORS.pageBg }}>
      {/* White header with border */}
      <SafeAreaView edges={['top']} className="bg-white">
        <View
          className="px-5 bg-white"
          style={{
            borderBottomWidth: 1,
            borderBottomColor: ExploreTheme.headerBorder,
            paddingVertical: 14,
          }}
        >
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-grotesk-bold" style={{ color: UI_COLORS.textPrimary }}>
              Profile
            </Text>
            <Pressable
              onPress={handleEditProfile}
              hitSlop={10}
              accessibilityLabel="Edit profile"
              accessibilityRole="button"
              className="px-3 py-2"
            >
              <MaterialIcons name="edit" size={20} color={UI_COLORS.link} />
            </Pressable>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={UI_COLORS.accent}
          />
        }
        contentContainerStyle={{ paddingBottom: tabBarHeight + 16 }}
      >

        {/* Avatar Section - Compact */}
        <View className="items-center py-6 px-5">
          <ProfileAvatar
            imageUrl={user?.avatar_url}
            username={user?.username || 'User'}
            size="md"
            editable
            onEditPress={handleEditProfile}
          />
          <Text
            className="text-xl font-grotesk-bold mt-3 mb-0.5"
            style={{ color: UI_COLORS.textPrimary }}
          >
            {user?.username || 'User'}
          </Text>
          {user?.created_at && (
            <Text className="text-xs font-inter mb-3" style={{ color: UI_COLORS.textSecondary }}>
              Joined {formatDate(user.created_at)}
            </Text>
          )}
          
          {/* Net Worth Pill */}
          <View
            className="mt-3 px-4 py-1.5 rounded-full"
            style={{
              backgroundColor: UI_COLORS.accentSoft,
              borderWidth: 1,
              borderColor: UI_COLORS.accentBorder,
            }}
          >
            <Text className="text-sm font-jetbrain-bold" style={{ color: UI_COLORS.accent }}>
              Net Worth: ${userData?.balance?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
            </Text>
          </View>

          {!isOwnProfile ? (
            <View className="mt-4 items-center">
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

        {/* Stats Grid - THE HERO - placed right after avatar */}
        <View className="flex-row gap-3 px-5 mb-6">
          <StatCard
            label="Win Rate"
            value={`${stats?.winRate ?? 0}%`}
            trend={stats?.winRate && stats.winRate >= 50 ? 'up' : 'down'}
            trendLabel={stats?.topPercent ? `Top ${stats.topPercent}%` : undefined}
          />
          <StatCard
            label="Predictions"
            value={stats?.predictions ?? 0}
            subtitle="All time"
          />
        </View>



        {/* Recent Activity */}
        <View className="px-5 mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="font-grotesk-bold text-[18px] flex-1" style={{ color: ExploreTheme.titleText }}>
              Recent Activity
            </Text>
            <Pressable
              onPress={() => {}}
              hitSlop={10}
              accessibilityLabel="View all activity"
              accessibilityRole="button"
              className="flex-row items-center gap-1"
            >
              <Text className="font-jetbrain text-[13px]" style={{ color: ExploreTheme.linkText }}>
                View All
              </Text>
              <MaterialIcons name="arrow-forward-ios" size={12} color={ExploreTheme.linkText} />
            </Pressable>
          </View>

          <View
            className="rounded-xl overflow-hidden"
            style={{ backgroundColor: UI_COLORS.surface, borderWidth: 1, borderColor: UI_COLORS.border }}
          >
            {activities.length === 0 ? (
              <EmptyState
                icon="history"
                title="No activity yet"
                description="Start making predictions to see your activity"
              />
            ) : (
              activities.map((activity, index) => (
                <View key={activity.id}>
                  <ActivityItem
                    icon={activity.icon}
                    title={activity.title}
                    result={activity.result}
                    amount={activity.amount}
                    roi={activity.roi}
                    date={activity.date}
                  />
                  {index < activities.length - 1 && (
                    <View
                      className="h-[1px] ml-13"
                      style={{ backgroundColor: UI_COLORS.border }}
                    />
                  )}
                </View>
              ))
            )}
          </View>
        </View>

        {/* Settings Menu */}
        <View className="px-5 mb-6">
          <Text className="font-grotesk-bold text-[18px] mb-3" style={{ color: ExploreTheme.titleText }}>
            Settings
          </Text>

          <View
            className="rounded-xl overflow-hidden"
            style={{ backgroundColor: UI_COLORS.surface, borderWidth: 1, borderColor: UI_COLORS.border }}
          >
            <SettingsItem
              icon="notifications"
              label="Notifications"
              onPress={() => Alert.alert('Notifications', 'Coming soon!')}
            />
            <View className="h-[1px] ml-13" style={{ backgroundColor: UI_COLORS.border }} />
            <SettingsItem
              icon="help-outline"
              label="Support"
              onPress={() => Alert.alert('Support', 'Coming soon!')}
            />
            <View className="h-[1px] ml-13" style={{ backgroundColor: UI_COLORS.border }} />
            <SettingsItem
              icon="lock"
              label="Security"
              onPress={() => Alert.alert('Security', 'Coming soon!')}
            />
            <View className="h-[1px] ml-13" style={{ backgroundColor: UI_COLORS.border }} />
            <SettingsItem
              icon="logout"
              label="Log Out"
              destructive
              showChevron={false}
              onPress={handleLogout}
            />
          </View>
        </View>

        {/* Version Footer */}
        <View className="items-center py-6">
          <Text className="text-2xs font-jetbrain" style={{ color: UI_COLORS.textMuted }}>
            v1.0.0
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
