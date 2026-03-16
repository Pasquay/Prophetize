import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { ExploreTheme } from '@/constants/explore-theme';
import { UI_COLORS } from '@/constants/ui-tokens';

export type LeaderboardPeriod = 'weekly' | 'all_time';

type Props = {
    selected: LeaderboardPeriod;
    onChange: (period: LeaderboardPeriod) => void;
};

export default function LeaderboardSegment({ selected, onChange }: Props) {
    return (
        <View
            className="flex-row rounded-2xl p-1"
            style={{ borderWidth: 1, borderColor: ExploreTheme.headerBorder, backgroundColor: UI_COLORS.surfaceMuted }}
        >
            <Pressable
                className="flex-1 rounded-xl py-2 items-center"
                style={selected === 'weekly' ? { backgroundColor: UI_COLORS.surface } : undefined}
                onPress={() => onChange('weekly')}
            >
                <Text
                    className="font-grotesk-bold text-[12px]"
                    style={{ color: selected === 'weekly' ? ExploreTheme.linkText : UI_COLORS.textSecondary }}
                >
                    Weekly
                </Text>
            </Pressable>
            <Pressable
                className="flex-1 rounded-xl py-2 items-center"
                style={selected === 'all_time' ? { backgroundColor: UI_COLORS.surface } : undefined}
                onPress={() => onChange('all_time')}
            >
                <Text
                    className="font-grotesk-bold text-[12px]"
                    style={{ color: selected === 'all_time' ? ExploreTheme.linkText : UI_COLORS.textSecondary }}
                >
                    All Time
                </Text>
            </Pressable>
        </View>
    );
}
