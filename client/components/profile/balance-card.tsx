import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { UI_COLORS } from '@/constants/ui-tokens';

type BalanceCardProps = {
  balance: number;
  showIcon?: boolean;
  onPress?: () => void;
};

export function BalanceCard({ balance, showIcon = true, onPress }: BalanceCardProps) {
  const formatted = balance.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const Content = (
    <View
      className="flex-row items-center gap-3 px-4 py-3"
      style={{
        backgroundColor: UI_COLORS.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: UI_COLORS.border,
      }}
    >
      {showIcon && (
        <Image
          source={require('../../assets/app-icons/p-coin.png')}
          style={{ width: 32, height: 32 }}
          resizeMode="contain"
        />
      )}

      <View className="flex-1">
        <Text
          className="text-xs font-inter"
          style={{ color: UI_COLORS.textSecondary }}
        >
          Balance
        </Text>
        <Text
          className="text-xl font-jetbrain-bold"
          style={{ color: UI_COLORS.textPrimary }}
        >
          {formatted}
        </Text>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        hitSlop={10}
        accessibilityLabel={`Total balance: ${formatted} P-coins`}
        accessibilityRole="button"
        className="w-full"
      >
        {Content}
      </Pressable>
    );
  }

  return <View className="w-full">{Content}</View>;
}
