import React, { useMemo, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ExploreTheme } from '@/constants/explore-theme';
import * as api from '@/utils/api';

const demoNotifications: api.NotificationPayload[] = [
  {
    type: 'market',
    recipient_user_id: 'demo-user',
    title: 'Market moved quickly',
    body: 'Bitcoin > 100k saw a strong move.',
    target_path: '/marketDetails?id=42',
    target_signature: 'local-demo-signature',
  },
  {
    type: 'leaderboard',
    recipient_user_id: 'demo-user',
    title: 'Ranking update',
    body: 'You climbed into the weekly top 10.',
    target_path: '/tabs/leaderboard',
    target_signature: 'local-demo-signature',
  },
  {
    type: 'profile',
    recipient_user_id: 'demo-user',
    title: 'New follower',
    body: 'Someone followed your profile.',
    target_path: '/tabs/profile?userId=user-2',
    target_signature: 'local-demo-signature',
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const [followingProfiles, setFollowingProfiles] = useState<Record<string, boolean>>({});
  const [followLoading, setFollowLoading] = useState<Record<string, boolean>>({});

  const items = useMemo(() => demoNotifications, []);

  const handlePress = (payload: api.NotificationPayload) => {
    const target = api.resolveNotificationTarget(payload);
    if (!target) {
      Alert.alert('Unsupported notification target');
      return;
    }

    router.push(target as never);
  };

  const handleFollowFromNotification = async (payload: api.NotificationPayload) => {
    const target = api.resolveNotificationTarget(payload);
    const targetUserId = target?.pathname === '/tabs/profile' ? target.params?.userId : undefined;

    if (!targetUserId) {
      Alert.alert('Missing profile target');
      return;
    }

    const isFollowing = Boolean(followingProfiles[targetUserId]);
    setFollowLoading((current) => ({ ...current, [targetUserId]: true }));
    const action: api.FollowAction = isFollowing ? 'unfollow' : 'follow';
    const { ok, data } = await api.followUser(targetUserId, action);
    setFollowLoading((current) => ({ ...current, [targetUserId]: false }));

    if (!ok) {
      Alert.alert('Follow action failed', data?.error ?? 'Unable to update follow status.');
      return;
    }

    setFollowingProfiles((current) => ({
      ...current,
      [targetUserId]: Boolean(data?.relationship?.following),
    }));
  };

  return (
    <View className="flex-1" style={{ backgroundColor: ExploreTheme.pageBg }}>
      <SafeAreaView edges={['top']} className="bg-white">
        <View
          className="px-5 bg-white"
          style={{
            borderBottomWidth: 1,
            borderBottomColor: ExploreTheme.headerBorder,
            paddingVertical: 14,
          }}
        >
          <View className="flex-row items-center gap-2">
            <Pressable onPress={() => router.back()} hitSlop={12}>
              <MaterialIcons name="arrow-back" size={22} color={ExploreTheme.titleText} />
            </Pressable>
            <Text className="font-grotesk-bold text-[20px]" style={{ color: ExploreTheme.titleText }}>
              Notifications
            </Text>
          </View>
        </View>
      </SafeAreaView>

      <View className="px-5 py-4 gap-3">
        {items.map((item, index) => {
          const profileTarget = api.resolveNotificationTarget(item);
          const profileUserId =
            profileTarget?.pathname === '/tabs/profile' ? profileTarget.params?.userId : undefined;
          const profileLoading = profileUserId ? Boolean(followLoading[profileUserId]) : false;
          const profileFollowing = profileUserId ? Boolean(followingProfiles[profileUserId]) : false;

          return (
            <View
              key={`${item.type}-${index}`}
              className="rounded-xl p-4"
              style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: ExploreTheme.headerBorder }}
            >
              <Text className="font-grotesk-bold text-[15px] mb-1" style={{ color: ExploreTheme.titleText }}>
                {item.title}
              </Text>
              <Text className="font-jetbrain text-[12px]" style={{ color: ExploreTheme.secondaryText }}>
                {item.body}
              </Text>

              <View className="flex-row gap-2 mt-3">
                <Pressable
                  onPress={() => handlePress(item)}
                  className="px-3 py-2 rounded-lg"
                  style={{ backgroundColor: ExploreTheme.titleText }}
                >
                  <Text className="font-jetbrain text-[11px]" style={{ color: '#FFFFFF' }}>
                    Open
                  </Text>
                </Pressable>

                {item.type === 'profile' && (
                  <Pressable
                    onPress={() => handleFollowFromNotification(item)}
                    disabled={profileLoading}
                    className="px-3 py-2 rounded-lg"
                    style={{ backgroundColor: profileFollowing ? '#6C757D' : '#0F8A5F' }}
                  >
                    <Text className="font-jetbrain text-[11px]" style={{ color: '#FFFFFF' }}>
                      {profileLoading ? 'Updating...' : profileFollowing ? 'Following' : 'Follow'}
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
