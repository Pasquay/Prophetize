import React from 'react';
import { Text, TextInput, View } from 'react-native';
import { ExploreTheme } from '@/constants/explore-theme';
import { UI_COLORS } from '@/constants/ui-tokens';

type CreateMarketFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
  helperText?: string;
  errorText?: string;
};

export function CreateMarketField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  helperText,
  errorText,
}: CreateMarketFieldProps) {
  return (
    <View className="mb-4">
      <Text className="font-jetbrain-bold text-[11px] tracking-widest mb-2" style={{ color: ExploreTheme.secondaryText }}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        multiline={multiline}
        autoCapitalize="none"
        className="rounded-2xl px-4 py-3 font-jetbrain"
        style={{
          backgroundColor: UI_COLORS.createMarket.fieldBg,
          borderWidth: 1,
          borderColor: errorText ? UI_COLORS.createMarket.fieldBorderError : UI_COLORS.createMarket.fieldBorder,
          color: ExploreTheme.titleText,
          minHeight: multiline ? 104 : 48,
          textAlignVertical: multiline ? 'top' : 'center',
        }}
      />
      {errorText ? (
        <Text className="font-jetbrain text-[12px] mt-2" style={{ color: UI_COLORS.danger }}>
          {errorText}
        </Text>
      ) : helperText ? (
        <Text className="font-jetbrain text-[12px] mt-2" style={{ color: ExploreTheme.secondaryText }}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}
