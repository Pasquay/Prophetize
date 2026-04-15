import React from 'react';
import { Text, View, Image } from 'react-native';
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
    const getMedalLabel = (rank: number) => {
        if (rank === 1) return 'Champion';
        if (rank === 2) return 'Runner-up';
        return 'Third place';
    };

    return (
        <View className="flex-row items-end gap-3">
            {ordered.map((entry) => {
                const isCenter = entry.rank === 1;
                const topStyles = getTopRankStyle(entry.rank);
                const netWorth = Number.isFinite(entry.netWorth) ? entry.netWorth : 0;
                const valueColor = UI_COLORS.success;
                const valueLabel = netWorth.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                });

                return (
                    <View key={`podium-${entry.rank}-${entry.username}`} className="flex-1" style={{ marginTop: isCenter ? 0 : 14 }}>
                        <View
                            className="overflow-hidden rounded-2xl border"
                            style={{
                                borderColor: topStyles.borderColor,
                                backgroundColor: topStyles.cardBg,
                                minHeight: isCenter ? 174 : 152,
                                shadowColor: topStyles.shadowColor,
                                shadowOpacity: isCenter ? 0.12 : 0.08,
                                shadowOffset: { width: 0, height: isCenter ? 8 : 6 },
                                shadowRadius: isCenter ? 12 : 10,
                                elevation: isCenter ? 4 : 3,
                            }}
                        >
                            <View className="px-3 py-2" style={{ backgroundColor: topStyles.stripeBg }}>
                                <View className="flex-row items-center justify-between">
                                    <View className="rounded-md px-2 py-1" style={{ backgroundColor: topStyles.cardBg }}>
                                        <Text className="font-jetbrain-bold text-[11px]" style={{ color: topStyles.rankColor }}>
                                            #{entry.rank}
                                        </Text>
                                    </View>
                                    <View className="flex-row items-center gap-1 px-1">
                                        <Image
                                            source={require('../../assets/app-icons/p-coin.png')}
                                            style={{ width: 11, height: 11 }}
                                            resizeMode="contain"
                                        />
                                        <Text className="font-jetbrain-bold text-[11px]" style={{ color: valueColor }}>
                                            {valueLabel}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            <View className="px-3 pb-3" style={{ paddingTop: isCenter ? 14 : 10 }}>
                            {entry.rank === 1 && (
                                <View className="absolute right-3 top-2 rounded-full px-2 py-1" style={{ backgroundColor: '#FFF3D6', borderWidth: 1, borderColor: '#E7CB62' }}>
                                    <MaterialIcons name="workspace-premium" size={13} color="#B67B00" />
                                </View>
                            )}

                                <View className="h-12 w-12 items-center justify-center rounded-full border" style={{ backgroundColor: topStyles.badgeBg, borderColor: topStyles.borderColor }}>
                                    <Text className="font-grotesk-bold text-[18px]" style={{ color: topStyles.badgeColor }}>
                                        {entry.initials}
                                    </Text>
                                </View>

                                <Text className="mt-2 font-grotesk-bold text-[13px]" style={{ color: ExploreTheme.titleText }} numberOfLines={1}>
                                    {entry.username}
                                </Text>
                                <Text className="font-jetbrain text-[11px]" style={{ color: ExploreTheme.secondaryText }}>
                                    {entry.wins} correct picks
                                </Text>

                                <Text className="mt-2 font-jetbrain text-[10px] uppercase tracking-[1.1px]" style={{ color: topStyles.rankColor }}>
                                    {getMedalLabel(entry.rank)}
                                </Text>
                            </View>
                        </View>
                    </View>
                );
            })}
        </View>
    );
}
