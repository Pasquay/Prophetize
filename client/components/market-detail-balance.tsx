import { Image, Text, View } from 'react-native';
import { useUserStore } from '../context/useUserStore';

export default function MarketDetailBalance() {
    const {userData} = useUserStore();
    return(
        <View
            className="self-start flex-row items-center gap-2 rounded-full bg-white px-4 py-2 border-[1px] border-[#E2E8F0]"
            style={{
                shadowColor: '#90E0EF',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.45,
                shadowRadius: 6,
                elevation: 4,
            }}
        >
            <Image
                source={require('../assets/app-icons/p-coin.png')}
                style={{ width: 22, height: 22 }}
                resizeMode="contain"
            />
            <Text className="font-jetbrain-bold text-lg text-[#0D1117]">
                {(userData?.balance ?? 0).toLocaleString()}
            </Text>
        </View>
    )
}