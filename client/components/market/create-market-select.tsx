import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { ExploreTheme } from '@/constants/explore-theme';
import { UI_COLORS } from '@/constants/ui-tokens';

type SelectOption = {
  label: string;
  value: string;
};

type CreateMarketSelectProps = {
  label: string;
  options: SelectOption[];
  selectedValue: string;
  onChange: (value: string) => void;
};

export function CreateMarketSelect({ label, options, selectedValue, onChange }: CreateMarketSelectProps) {
  const [open, setOpen] = useState(false);

  const selectedLabel = useMemo(() => {
    const option = options.find((item) => item.value === selectedValue);
    return option?.label ?? 'Select';
  }, [options, selectedValue]);

  return (
    <View className="mb-3">
      <Text className="font-jetbrain-bold text-[11px] tracking-widest mb-2" style={{ color: ExploreTheme.secondaryText }}>
        {label}
      </Text>
      <Pressable
        onPress={() => setOpen((current) => !current)}
        className="rounded-2xl px-4 py-3"
        style={{
          backgroundColor: UI_COLORS.createMarket.fieldBg,
          borderWidth: 1,
          borderColor: UI_COLORS.createMarket.fieldBorder,
          minHeight: 48,
        }}
      >
        <Text className="font-jetbrain text-[13px]" style={{ color: ExploreTheme.titleText }}>
          {selectedLabel}
        </Text>
      </Pressable>

      {open ? (
        <View
          className="rounded-2xl mt-2"
          style={{
            borderWidth: 1,
            borderColor: UI_COLORS.createMarket.fieldBorder,
            backgroundColor: UI_COLORS.surface,
            maxHeight: 220,
          }}
        >
          <ScrollView nestedScrollEnabled>
            {options.map((option) => {
              const isActive = option.value === selectedValue;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className="px-4 py-3"
                  style={{
                    backgroundColor: isActive ? UI_COLORS.createMarket.chipBgActive : UI_COLORS.surface,
                    borderBottomWidth: 1,
                    borderBottomColor: UI_COLORS.borderSoft,
                  }}
                >
                  <Text className="font-jetbrain text-[13px]" style={{ color: ExploreTheme.titleText }}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}
