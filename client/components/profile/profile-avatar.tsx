import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { UI_COLORS } from '@/constants/ui-tokens';

type ProfileAvatarProps = {
  imageUrl?: string;
  username: string;
  size?: 'sm' | 'md' | 'lg';
  editable?: boolean;
  onEditPress?: () => void;
};

const SIZE_MAP = {
  sm: { container: 64, avatar: 64, text: 'text-2xl' },
  md: { container: 96, avatar: 96, text: 'text-4xl' },
  lg: { container: 128, avatar: 128, text: 'text-5xl' },
};

export function ProfileAvatar({
  imageUrl,
  username,
  size = 'md',
  editable = false,
  onEditPress,
}: ProfileAvatarProps) {
  const { container, avatar, text } = SIZE_MAP[size];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <View className="items-center">
      <View className="relative">
        <View
          className="rounded-full items-center justify-center overflow-hidden"
          style={{
            width: avatar,
            height: avatar,
            backgroundColor: UI_COLORS.accentSoft,
            borderWidth: 3,
            borderColor: UI_COLORS.surface,
          }}
        >
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={{ width: avatar, height: avatar }}
              className="rounded-full"
            />
          ) : (
            <Text className={`${text} font-grotesk-bold`} style={{ color: UI_COLORS.accent }}>
              {getInitials(username || 'User')}
            </Text>
          )}
        </View>

        {editable && (
          <Pressable
            onPress={onEditPress}
            hitSlop={10}
            accessibilityLabel="Edit profile picture"
            accessibilityRole="button"
            accessibilityHint="Opens avatar editor"
            className="absolute bottom-0 right-0 rounded-full p-1.5"
            style={{ backgroundColor: UI_COLORS.accent }}
          >
            <MaterialIcons name="edit" size={16} color={UI_COLORS.surface} />
          </Pressable>
        )}
      </View>
    </View>
  );
}
