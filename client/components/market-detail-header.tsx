import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import { Text, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

type Props = {
    title:string;
}

export default function MarketDetailHeader({title}:Props) {
    const router = useRouter();
    return(
        <View className="flex-row items-center ">
            <Pressable onPress={() => router.back()}>
                <AntDesign name="arrow-left" size={20} color="black" />
            </Pressable>
            <View className="absolute inset-0 items-center justify-center" pointerEvents="none">
                <Text className="font-grotesk-bold text-2xl">{title}</Text>
            </View>
            <Pressable onPress={() => null} className="ml-auto">
                <Feather name="share-2" size={24} color="black" />
            </Pressable>
        </View>
    )
}