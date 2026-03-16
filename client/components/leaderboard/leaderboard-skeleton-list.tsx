import React from 'react';
import { StyleSheet, View } from 'react-native';

import LeaderboardSkeletonRow from './leaderboard-skeleton-row';

type Props = {
    count?: number;
    compact?: boolean;
};

export default function LeaderboardSkeletonList({ count = 4, compact = false }: Props) {
    return (
        <View style={styles.wrapper}>
            {Array.from({ length: count }).map((_, index) => (
                <LeaderboardSkeletonRow key={`leaderboard-skeleton-${index}`} compact={compact} />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        gap: 8,
    },
});