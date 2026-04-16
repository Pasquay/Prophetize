import React from 'react';
import { Text, View, Image } from 'react-native';

import { LeaderboardEntry } from './leaderboard-row';
import { ExploreTheme } from '@/constants/explore-theme';
import { UI_COLORS, UI_SHADOWS, UI_TYPE_SCALE } from '@/constants/ui-tokens';

type Props = {
    item: LeaderboardEntry;
};

export default function LeaderboardMyPositionCard({ item }: Props) {
    const netWorth = Number.isFinite(item.netWorth) ? item.netWorth : 0;
    const valueColor = UI_COLORS.success;
    const valueLabel = netWorth.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    return (
        <View
            className="rounded-2xl border px-3 py-3"
            style={{
                borderColor: UI_COLORS.leaderboard.self.border,
                backgroundColor: UI_COLORS.surface,
                ...UI_SHADOWS.lift,
            }}
        >
            <View className="absolute -top-2 right-3 rounded-md px-2 py-1" style={{ backgroundColor: UI_COLORS.accent }}>
                <Text className="font-jetbrain-bold text-[10px] text-white">YOU</Text>
            </View>

            <View className="flex-row items-center gap-3">
                <View className="h-8 min-w-8 items-center justify-center rounded-lg px-2" style={{ backgroundColor: UI_COLORS.accentSoft }}>
                    <Text className="font-jetbrain-bold text-[12px]" style={{ color: UI_COLORS.accent }}>
                        #{item.rank}
                    </Text>
                </View>

                <View className="h-10 w-10 items-center justify-center rounded-full border" style={{ backgroundColor: UI_COLORS.accentSoft, borderColor: UI_COLORS.borderSoft }}>
                    <Text className="font-grotesk-bold text-[16px]" style={{ color: UI_COLORS.accent }}>
                        {item.initials}
                    </Text>
                </View>

                <View className="flex-1">
                    <Text className="font-grotesk-bold text-[13px]" style={{ color: ExploreTheme.titleText, fontSize: UI_TYPE_SCALE.leaderboard.rowName }} numberOfLines={1}>
                        {item.username}
                    </Text>
                    <Text className="font-jetbrain text-[11px]" style={{ color: ExploreTheme.secondaryText, fontSize: UI_TYPE_SCALE.leaderboard.rowMeta }}>
                        {item.wins} correct calls
                    </Text>
                </View>

                <View className="flex-row items-center gap-1 px-1">
                    <Image
                        source={require('../../assets/app-icons/p-coin.png')}
                        style={{ width: 11, height: 11 }}
                        resizeMode="contain"
                    />
                    <Text className="font-jetbrain-bold text-[12px]" style={{ color: valueColor }}>
                        {valueLabel}
                    </Text>
                </View>
            </View>
        </View>
    );
}
