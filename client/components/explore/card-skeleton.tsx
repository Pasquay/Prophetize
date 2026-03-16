import { View } from 'react-native';

import { ExploreTheme } from '@/constants/explore-theme';
import SkeletonShell from '../skeleton/skeleton-shell';

export default function CardSkeleton() {
    return (
        <SkeletonShell
            style={{
                height: 140,
                borderRadius: 12,
                backgroundColor: ExploreTheme.sectionDivider,
                borderWidth: 1,
                borderColor: '#E2E8F0',
                paddingHorizontal: 14,
                paddingVertical: 14,
            }}
        >
            <View testID="card-skeleton" style={{ flex: 1, justifyContent: 'space-between' }}>
                <View style={{ gap: 9 }}>
                    <View
                        style={{
                            width: '72%',
                            height: 14,
                            borderRadius: 7,
                            backgroundColor: '#DDE6F2',
                        }}
                    />
                    <View
                        style={{
                            width: '54%',
                            height: 11,
                            borderRadius: 6,
                            backgroundColor: '#E6EDF7',
                        }}
                    />
                </View>

                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <View
                        style={{
                            width: 66,
                            height: 24,
                            borderRadius: 12,
                            backgroundColor: '#DEE8F5',
                        }}
                    />
                    <View
                        style={{
                            width: 84,
                            height: 24,
                            borderRadius: 12,
                            backgroundColor: '#D9F2E5',
                        }}
                    />
                </View>
            </View>
        </SkeletonShell>
    );
}
