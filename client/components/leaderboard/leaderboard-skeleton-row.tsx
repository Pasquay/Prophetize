import React from 'react';
import { StyleSheet, View } from 'react-native';
import SkeletonShell from '../skeleton/skeleton-shell';
import { UI_COLORS } from '@/constants/ui-tokens';

type Props = {
    compact?: boolean;
};

export default function LeaderboardSkeletonRow({ compact = false }: Props) {
    return (
        <SkeletonShell style={[styles.row, compact && styles.rowCompact]}>
            <View style={styles.content}>
                <View style={styles.rank} />
                <View style={styles.badge} />
                <View style={styles.textWrap}>
                    <View style={styles.textMain} />
                    <View style={styles.textSub} />
                </View>
                <View style={styles.profit} />
            </View>
        </SkeletonShell>
    );
}

const styles = StyleSheet.create({
    row: {
        minHeight: 64,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: UI_COLORS.leaderboard.skeleton.border,
        backgroundColor: UI_COLORS.leaderboard.skeleton.rowBg,
        paddingHorizontal: 12,
        justifyContent: 'center',
    },
    rowCompact: {
        minHeight: 56,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    rank: {
        width: 14,
        height: 14,
        borderRadius: 4,
        backgroundColor: UI_COLORS.leaderboard.skeleton.rank,
    },
    badge: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: UI_COLORS.leaderboard.skeleton.badge,
    },
    textWrap: {
        flex: 1,
        gap: 6,
    },
    textMain: {
        width: '62%',
        height: 12,
        borderRadius: 6,
        backgroundColor: UI_COLORS.leaderboard.skeleton.textMain,
    },
    textSub: {
        width: '34%',
        height: 10,
        borderRadius: 5,
        backgroundColor: UI_COLORS.leaderboard.skeleton.textSub,
    },
    profit: {
        width: 60,
        height: 12,
        borderRadius: 6,
        backgroundColor: UI_COLORS.leaderboard.skeleton.value,
    },
});