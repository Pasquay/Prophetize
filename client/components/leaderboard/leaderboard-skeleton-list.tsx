import React from 'react';
import { StyleSheet, View } from 'react-native';

import LeaderboardSkeletonRow from './leaderboard-skeleton-row';

type Props = {
    count?: number;
    compact?: boolean;
};

export default function LeaderboardSkeletonList({ count = 4, compact = false }: Props) {
    const skeletonKeys = Array.from({ length: count }, (_, i) => `leaderboard-skeleton-${i}`);
    return (
        <View style={styles.wrapper}>
            {skeletonKeys.map((key) => (
                <LeaderboardSkeletonRow key={key} compact={compact} />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        gap: 8,
    },
});
