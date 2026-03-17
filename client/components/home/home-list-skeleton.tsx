import React from 'react';
import { View } from 'react-native';

import CardSkeleton from '@/components/explore/card-skeleton';

type Props = {
    count?: number;
};

export default function HomeListSkeleton({ count = 5 }: Props) {
    const skeletonKeys = Array.from({ length: count }, (_, i) => `home-card-skeleton-${i}`);
    return (
        <View style={{ gap: 14 }}>
            {skeletonKeys.map((key) => (
                <CardSkeleton key={key} />
            ))}
        </View>
    );
}
