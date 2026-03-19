import React from 'react';
import { Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { ExploreTheme } from '@/constants/explore-theme';
import { LeaderboardEntry } from './leaderboard-row';
import { getTopRankStyle } from './leaderboard-style';
import { UI_COLORS } from '@/constants/ui-tokens';

type Props = {
    entries: LeaderboardEntry[];
};

const PODIUM_ORDER = [1, 0, 2];

export default function LeaderboardPodium({ entries }: Props) {
    const ordered = PODIUM_ORDER.map((index) => entries[index]).filter(Boolean) as LeaderboardEntry[];

    return (
        <View className="flex-row items-end gap-3">
            {ordered.map((entry) => {
                const isCenter = entry.rank === 1;
                const topStyles = getTopRankStyle(entry.rank);
                const profitColor = entry.profitPct >= 0 ? UI_COLORS.success : UI_COLORS.danger;
                const profitLabel = `${entry.profitPct >= 0 ? '+' : ''}${entry.profitPct.toFixed(1)}%`;

                return (
                    <View key={`podium-${entry.rank}-${entry.username}`} className="flex-1" style={{ marginTop: isCenter ? 0 : 12 }}>
                        <View
                            className="rounded-2xl border px-3"
                            style={{
                                borderColor: topStyles.borderColor,
                                backgroundColor: topStyles.cardBg,
                                paddingVertical: isCenter ? 14 : 10,
                                minHeight: isCenter ? 154 : 134,
                                shadowColor: '#0F172A',
                                shadowOpacity: 0.08,
                                shadowOffset: { width: 0, height: 8 },
                                shadowRadius: 14,
                                elevation: 3,
                            }}
                        >
                            {entry.rank === 1 && (
                                <View className="absolute left-2 top-2">
                                    <MaterialIcons name="workspace-premium" size={16} color="#C28C00" />
                                </View>
                            )}

                            <View className="flex-row items-center justify-between">
                                <Text className="font-jetbrain-bold text-[12px]" style={{ color: topStyles.rankColor }}>
                                    #{entry.rank}
                                </Text>
                                <Text className="font-jetbrain-bold text-[11px]" style={{ color: profitColor }}>
                                    {profitLabel}
                                </Text>
                            </View>

                            <View className="mt-3 h-12 w-12 items-center justify-center rounded-full border" style={{ backgroundColor: topStyles.badgeBg, borderColor: topStyles.borderColor }}>
                                <Text className="font-grotesk-bold text-[18px]" style={{ color: topStyles.badgeColor }}>
                                    {entry.initials}
                                </Text>
                            </View>

                            <Text className="mt-2 font-grotesk-bold text-[13px]" style={{ color: ExploreTheme.titleText }} numberOfLines={1}>
                                {entry.username}
                            </Text>
                            <Text className="font-jetbrain text-[11px]" style={{ color: ExploreTheme.secondaryText }}>
                                {entry.wins} wins
                            </Text>
                        </View>
                    </View>
                );
            })}
        </View>
    );
}
