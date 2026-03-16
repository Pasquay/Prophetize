import {Text, View} from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';
import { UI_COLORS } from '@/constants/ui-tokens';

export default function NoMarketsAvailable(){
    return (
        <View className="h-full justify-center">
            <View
                className="flex-col items-center h-auto p-6 rounded-xl border-[1px]"
                style={{ backgroundColor: UI_COLORS.surface, borderColor: UI_COLORS.border }}
            >
                <Text className="font-jetbrain-bold text-4xl text-center mb-4" style={{ color: UI_COLORS.textSecondary }}>
                    NO MARKETS FOR THIS CATEGORY AVAILABLE
                </Text>
                <Entypo name="emoji-sad" size={48} color={UI_COLORS.textSecondary} />
            </View>
        </View>
    )
}
