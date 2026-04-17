import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { ExploreTheme } from '@/constants/explore-theme';
import { UI_COLORS } from '@/constants/ui-tokens';

type CreateMarketChipGroupProps = {
  label: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
};

export function CreateMarketChipGroup({ label, options, selected, onSelect }: CreateMarketChipGroupProps) {
  return (
    <View className="mb-4">
      <Text className="font-jetbrain-bold text-[11px] tracking-widest mb-2" style={{ color: ExploreTheme.secondaryText }}>
        {label}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map((option) => {
          const isActive = selected === option;
          return (
            <Pressable
              key={option}
              onPress={() => onSelect(option)}
              className="rounded-full px-4 items-center justify-center"
              style={{
                minHeight: 44,
                backgroundColor: isActive ? UI_COLORS.createMarket.chipBgActive : UI_COLORS.createMarket.chipBg,
                borderWidth: 1,
                borderColor: isActive
                  ? UI_COLORS.createMarket.chipBorderActive
                  : UI_COLORS.createMarket.chipBorder,
              }}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`${option} category`}
            >
              <Text
                className="font-grotesk-bold text-[13px]"
                style={{ color: isActive ? ExploreTheme.linkText : UI_COLORS.createMarket.chipTextMuted }}
              >
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
