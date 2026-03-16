import React from 'react';
import { Text, View } from 'react-native';

import { LeaderboardEntry } from './leaderboard-row';
import { ExploreTheme } from '@/constants/explore-theme';
import { UI_COLORS } from '@/constants/ui-tokens';

type Props = {
    item: LeaderboardEntry;
};

export default function LeaderboardMyPositionCard({ item }: Props) {
    const profitColor = item.profitPct >= 0 ? '#10B981' : '#EF4444';
    const profitLabel = `${item.profitPct >= 0 ? '+' : ''}${item.profitPct.toFixed(1)}%`;

    return (
        <View
            className="rounded-2xl border px-3 py-3"
            style={{
                borderColor: UI_COLORS.accentBorder,
                backgroundColor: UI_COLORS.accentSoft,
                shadowColor: '#0F172A',
                shadowOpacity: 0.06,
                shadowOffset: { width: 0, height: 6 },
                shadowRadius: 10,
                elevation: 3,
            }}
        >
            <Text className="font-jetbrain-bold text-[10px] mb-2" style={{ color: ExploreTheme.secondaryText }}>
                YOUR RANK
            </Text>

            <View className="flex-row items-center">
                <Text className="font-jetbrain-bold text-[14px] w-11" style={{ color: ExploreTheme.titleText }}>
                    #{item.rank}
                </Text>
                <Text className="font-grotesk-bold text-[15px] flex-1" style={{ color: ExploreTheme.titleText }} numberOfLines={1}>
                    {item.username}
                </Text>
                <Text className="font-jetbrain-bold text-[13px]" style={{ color: profitColor }}>
                    {profitLabel}
                </Text>
            </View>
        </View>
    );
}
