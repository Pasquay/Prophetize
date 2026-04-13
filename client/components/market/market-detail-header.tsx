import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import { Alert, Text, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ExploreTheme } from '@/constants/explore-theme';

type Props = {
    title:string;
}

export default function MarketDetailHeader({title}:Props) {
    const router = useRouter();
    return(
        <View className="flex-row items-center ">
            <Pressable
                onPress={() => router.back()}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Go back"
                accessibilityHint="Returns to the previous screen"
                style={({ pressed }) => ({
                    opacity: pressed ? 0.85 : 1,
                    transform: [{ scale: pressed ? 0.92 : 1 }],
                })}
            >
                <AntDesign name="arrow-left" size={24} color={ExploreTheme.titleText} />
            </Pressable>
            <View className="absolute inset-0 items-center justify-center" pointerEvents="none">
                <Text className="font-grotesk-bold text-[18px]" style={{ color: ExploreTheme.titleText }}>
                    {title}
                </Text>
            </View>
            <Pressable
                onPress={() => Alert.alert('Share coming soon', 'Sharing this market will be available in a future update.')}
                className="ml-auto"
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Share market"
                accessibilityHint="Opens the share action for this market"
                style={({ pressed }) => ({
                    opacity: pressed ? 0.85 : 1,
                    transform: [{ scale: pressed ? 0.92 : 1 }],
                })}
            >
                <Feather name="share-2" size={24} color={ExploreTheme.titleText} />
            </Pressable>
        </View>
    )
}
