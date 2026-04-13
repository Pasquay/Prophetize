import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { UI_COLORS } from '@/constants/ui-tokens';
import { ExploreTheme } from '@/constants/explore-theme';

type Props = {
  values: number[];
  labels: string[];
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export default function MarketDetailTrendChart({ values, labels }: Props) {
  const points = useMemo(() => {
    const safeValues = values.length ? values : [50, 52, 56, 59, 62];
    const count = safeValues.length;
    const chartW = 100;
    const chartH = 56;
    const step = count > 1 ? chartW / (count - 1) : chartW;

    return safeValues.map((value, index) => {
      const normalized = clamp(value, 0, 100);
      const x = index * step;
      const y = chartH - (normalized / 100) * chartH;
      return { x, y };
    });
  }, [values]);

  const linePath = useMemo(() => {
    if (!points.length) return '';

    return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
  }, [points]);

  const areaPath = useMemo(() => {
    if (!points.length) return '';

    const first = points[0];
    const last = points[points.length - 1];
    return `${linePath} L ${last.x} 56 L ${first.x} 56 Z`;
  }, [linePath, points]);

  return (
    <View>
      <View className="px-4">
        <Text className="font-jetbrain text-[11px] tracking-widest" style={{ color: ExploreTheme.secondaryText }}>
          PROBABILITY TREND
        </Text>
      </View>
      <Svg width="100%" height={188} viewBox="0 0 100 64" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={UI_COLORS.accentSoft} stopOpacity="1" />
            <Stop offset="1" stopColor={UI_COLORS.accentSoft} stopOpacity="0.12" />
          </LinearGradient>
        </Defs>
        <Path d={areaPath} fill="url(#trendFill)" />
        <Path d={linePath} stroke={UI_COLORS.accent} strokeWidth={2.5} fill="none" />
      </Svg>
      <View className="flex-row justify-between px-5">
        {labels.map((label) => (
          <Text key={label} className="font-jetbrain text-[10px]" style={{ color: ExploreTheme.secondaryText }}>
            {label}
          </Text>
        ))}
      </View>
    </View>
  );
}
