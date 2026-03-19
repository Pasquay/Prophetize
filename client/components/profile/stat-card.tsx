import React from 'react';
import { View, Text } from 'react-native';
import { UI_COLORS } from '@/constants/ui-tokens';

type StatCardProps = {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  onPress?: () => void;
};

export function StatCard({
  label,
  value,
  subtitle,
  trend,
  trendLabel,
}: StatCardProps) {
  const getTrendColor = () => {
    if (trend === 'up') return UI_COLORS.success;
    if (trend === 'down') return UI_COLORS.danger;
    return UI_COLORS.textMuted;
  };

  return (
    <View
      className="flex-1 px-4 py-5"
      style={{
        backgroundColor: UI_COLORS.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: UI_COLORS.border,
      }}
    >
      {/* Label */}
      <Text
        className="text-xs font-inter uppercase mb-2"
        style={{ color: UI_COLORS.textSecondary, letterSpacing: 0.5 }}
      >
        {label}
      </Text>

      {/* Value - Make this BIG and bold */}
      <Text
        className="text-4xl font-grotesk-bold mb-1"
        style={{ color: UI_COLORS.textPrimary, letterSpacing: -1 }}
      >
        {value}
      </Text>

      {/* Subtitle or Trend */}
      {subtitle && (
        <Text
          className="text-xs font-inter"
          style={{ color: trend ? getTrendColor() : UI_COLORS.textSecondary }}
        >
          {trendLabel || subtitle}
        </Text>
      )}
    </View>
  );
}
