import React from 'react';
import { Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { getTopRankStyle } from './leaderboard-style';
import { UI_COLORS } from '@/constants/ui-tokens';

export type LeaderboardEntry = {
    rank: number;
    username: string;
    initials: string;
    wins: number;
    profitPct: number;
    isCurrentUser?: boolean;
};

type Props = {
    item: LeaderboardEntry;
};

export default function LeaderboardRow({ item }: Props) {
    const isTopThree = item.rank <= 3;
    const isCurrentUser = item.isCurrentUser;
    const topStyles = getTopRankStyle(item.rank);
    const profitColor = item.profitPct >= 0 ? '#10B981' : '#EF4444';
    const profitLabel = `${item.profitPct >= 0 ? '+' : ''}${item.profitPct.toFixed(1)}%`;

    if (!isTopThree) {
        return (
            <View className="px-1 py-2">
                <View
                    className="flex-row items-center gap-3 py-2 px-2 rounded-xl"
                    style={{
                        backgroundColor: isCurrentUser ? UI_COLORS.accentSoft : 'transparent',
                        borderWidth: isCurrentUser ? 1 : 0,
                        borderColor: isCurrentUser ? UI_COLORS.accentBorder : 'transparent',
                    }}
                >
                    <Text className="font-jetbrain-bold text-[12px] w-5 text-center" style={{ color: UI_COLORS.textSecondary }}>
                        {item.rank}
                    </Text>

                    <View className="h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: UI_COLORS.accentSoft }}>
                        <Text className="font-grotesk-bold text-[16px]" style={{ color: UI_COLORS.accent }}>
                            {item.initials}
                        </Text>
                    </View>

                    <Text className="font-grotesk-bold text-[12px] flex-1" style={{ color: UI_COLORS.textPrimary }} numberOfLines={1}>
                        {item.username}
                    </Text>

                    <Text className="font-jetbrain-bold text-[11px]" style={{ color: profitColor }}>
                        {profitLabel}
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View
            className="rounded-2xl border px-3 py-3"
            style={{
                borderColor: isCurrentUser ? UI_COLORS.accentBorder : topStyles.borderColor,
                backgroundColor: isCurrentUser ? UI_COLORS.accentSoft : topStyles.cardBg,
                shadowColor: '#0F172A',
                shadowOpacity: 0.06,
                shadowOffset: { width: 0, height: 6 },
                shadowRadius: 10,
                elevation: 2,
            }}
        >
            {item.rank === 1 && (
                <View className="absolute left-1 top-1 z-10">
                    <MaterialIcons name="emoji-events" size={16} color="#D89E00" />
                </View>
            )}

            <View className="flex-row items-center gap-3">
                <Text className="font-jetbrain-bold text-[13px] w-5 text-center" style={{ color: topStyles.rankColor }}>
                    {item.rank}
                </Text>

                <View
                    className="h-10 w-10 items-center justify-center rounded-full border"
                    style={{ backgroundColor: topStyles.badgeBg, borderColor: topStyles.borderColor }}
                >
                    <Text className="font-grotesk-bold text-[16px]" style={{ color: topStyles.badgeColor }}>
                        {item.initials}
                    </Text>
                </View>

                <View className="flex-1">
                    <Text className="font-grotesk-bold text-[12px]" style={{ color: UI_COLORS.textPrimary }} numberOfLines={1}>
                        {item.username}
                    </Text>
                    <Text className="font-jetbrain text-[11px]" style={{ color: UI_COLORS.textMuted }}>
                        {item.wins} wins
                    </Text>
                </View>

                <Text className="font-jetbrain-bold text-[12px]" style={{ color: profitColor }}>
                    {profitLabel}
                </Text>
            </View>
        </View>
    );
}
