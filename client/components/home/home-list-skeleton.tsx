import React from 'react';
import { View } from 'react-native';

import CardSkeleton from '@/components/explore/card-skeleton';

type Props = {
    count?: number;
};

export default function HomeListSkeleton({ count = 5 }: Props) {
    return (
        <View style={{ gap: 14 }}>
            {Array.from({ length: count }).map((_, index) => (
                <CardSkeleton key={`home-card-skeleton-${index}`} />
            ))}
        </View>
    );
}
