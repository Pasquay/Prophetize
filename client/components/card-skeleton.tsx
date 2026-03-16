import { View } from 'react-native';

import { ExploreTheme } from '../constants/explore-theme';

export default function CardSkeleton() {
    return (
        <View
            testID="card-skeleton"
            style={{
                height: 140,
                borderRadius: 12,
                backgroundColor: ExploreTheme.sectionDivider,
                borderWidth: 1,
                borderColor: '#E2E8F0',
            }}
        />
    );
}
