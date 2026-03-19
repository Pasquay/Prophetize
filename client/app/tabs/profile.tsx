import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, Alert, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { useAuth } from '../../context/AuthContext';
import { useUserStore } from '../../context/useUserStore';
import * as api from '../../utils/api';
import { UI_COLORS } from '@/constants/ui-tokens';

import { ProfileAvatar } from '@/components/profile/profile-avatar';
import { BalanceCard } from '@/components/profile/balance-card';
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
  icon: string;
  title: string;
  result: 'won' | 'lost' | 'pending';
  amount: string;
  roi: string;
  date: string;
};

export default function ProfileScreen() {
  const router = useRouter();
  const { logout, isLoading: authLoading, user } = useAuth();
  const { userData, fetchUserData } = useUserStore();

  const [stats, setStats] = useState<UserStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
          icon: 'currency-bitcoin',
          title: 'Bitcoin > $100k by Q4',
          result: 'won',
          amount: '+500.00',
          roi: '125% ROI',
          date: 'Oct 24, 2023',
        },
        {
          id: '2',
          icon: 'rocket-launch',
          title: 'SpaceX Launch Success',
          result: 'lost',
          amount: '-200.00',
          roi: '0% ROI',
          date: 'Oct 22, 2023',
        },
        {
          id: '3',
          icon: 'sports-soccer',
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
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-3">
          <Text className="text-xl font-grotesk-bold" style={{ color: UI_COLORS.textPrimary }}>
            Profile
          </Text>
          <Pressable
            onPress={handleEditProfile}
            hitSlop={10}
            accessibilityLabel="Edit profile"
            accessibilityRole="button"
            className="px-3 py-1.5"
          >
            <Text className="text-sm font-inter" style={{ color: UI_COLORS.link }}>
              Edit
            </Text>
          </Pressable>
        </View>

        {/* Avatar Section - Compact */}
        <View className="items-center py-4 px-5">
          <ProfileAvatar
            imageUrl={user?.avatar_url}
            username={user?.username || 'User'}
            size="sm"
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
            <Text className="text-xs font-inter" style={{ color: UI_COLORS.textSecondary }}>
              Joined {formatDate(user.created_at)}
            </Text>
          )}
        </View>

        {/* Stats Grid - THE HERO - placed right after avatar */}
        <View className="flex-row gap-3 px-5 mb-4">
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

        {/* Balance Card - Compact, secondary */}
        <View className="px-5 mb-6">
          <BalanceCard balance={userData?.balance ?? 0} />
        </View>

        {/* Recent Activity */}
        <View className="px-5 mb-6">
          <View className="flex-row items-center justify-between mb-2">
            <Text
              className="text-xs font-inter uppercase tracking-wide"
              style={{ color: UI_COLORS.textMuted, letterSpacing: 0.5 }}
            >
              Recent Activity
            </Text>
            <Pressable
              onPress={() => {}}
              hitSlop={10}
              accessibilityLabel="View all activity"
              accessibilityRole="button"
            >
              <Text className="text-sm font-inter" style={{ color: UI_COLORS.link }}>
                View All
              </Text>
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
          <Text
            className="text-xs font-inter uppercase tracking-wide mb-2"
            style={{ color: UI_COLORS.textMuted, letterSpacing: 0.5 }}
          >
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
    </SafeAreaView>
  );
}
