import React from 'react';
import { View, Text, Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { UI_COLORS } from '@/constants/ui-tokens';

type SettingsItemProps = {
  icon: string;
  label: string;
  value?: string;
  showChevron?: boolean;
  destructive?: boolean;
  onPress: () => void;
};

export function SettingsItem({
  icon,
  label,
  value,
  showChevron = true,
  destructive = false,
  onPress,
}: SettingsItemProps) {
  const textColor = destructive ? UI_COLORS.danger : UI_COLORS.textPrimary;
  const iconColor = destructive ? UI_COLORS.danger : UI_COLORS.accent;

  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      accessibilityLabel={`${label}${value ? `, ${value}` : ''}`}
      accessibilityRole="button"
      accessibilityHint="Opens settings"
      className="w-full"
    >
      <View className="flex-row items-center py-3 px-4 gap-3">
        {/* Icon with background - like rest of app */}
        <View
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: UI_COLORS.accentSoft }}
        >
          <MaterialIcons name={icon as any} size={20} color={iconColor} />
        </View>

        {/* Label */}
        <Text className="flex-1 text-base font-inter" style={{ color: textColor }}>
          {label}
        </Text>

        {/* Value (optional) */}
        {value && (
          <Text className="text-sm font-inter mr-2" style={{ color: UI_COLORS.textMuted }}>
            {value}
          </Text>
        )}

        {/* Chevron */}
        {showChevron && (
          <MaterialIcons name="chevron-right" size={20} color={UI_COLORS.textMuted} />
        )}
      </View>
    </Pressable>
  );
}
