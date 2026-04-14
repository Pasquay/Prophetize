import React from 'react';
import { View, Text, Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { UI_COLORS } from '@/constants/ui-tokens';

type EmptyStateProps = {
  icon?: keyof typeof MaterialIcons.glyphMap;  // Icon name from MaterialIcons
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

/**
 * Reusable empty state component with empathetic design
 * Matches the style of "You reached the end" indicator
 * @example
 * <EmptyState
 *   icon="inbox"
 *   title="No markets yet"
 *   description="Check back later for new prediction markets"
 * />
 */
export function EmptyState({
  icon = 'inbox',
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View className="items-center justify-center py-8 gap-3">
      {/* Icon - smaller, more subtle */}
      <View
        className="w-16 h-16 rounded-full items-center justify-center"
        style={{ backgroundColor: UI_COLORS.surfaceMuted }}
      >
        <MaterialIcons name={icon} size={32} color={UI_COLORS.textMuted} />
      </View>

      {/* Title - use same style as end indicator */}
      <Text
        className="font-jetbrain text-[14px] text-center"
        style={{ color: UI_COLORS.textSecondary }}
      >
        {title}
      </Text>

      {/* Description - same style as title for consistency */}
      {description && (
        <Text
          className="font-jetbrain text-[14px] text-center px-8"
          style={{ color: UI_COLORS.textSecondary }}
        >
          {description}
        </Text>
      )}

      {/* Action Button - only if provided */}
      {actionLabel && onAction && (
        <Pressable
          onPress={onAction}
          className="mt-2 px-4 py-2 rounded-lg border"
          style={{
            borderColor: UI_COLORS.border,
            backgroundColor: UI_COLORS.surface,
          }}
          hitSlop={10}
          accessibilityLabel={actionLabel}
          accessibilityRole="button"
          accessibilityHint={actionLabel}
        >
          <Text className="font-jetbrain-bold text-[13px]" style={{ color: UI_COLORS.link }}>
            {actionLabel}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
