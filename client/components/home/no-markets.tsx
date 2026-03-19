import {Text, View} from 'react-native';
import { EmptyState } from '@/components/common/empty-state';

export default function NoMarketsAvailable(){
    return (
        <EmptyState
            icon="workspace-premium"
            title="No markets available"
            description="Try selecting a different category"
        />
    )
}
