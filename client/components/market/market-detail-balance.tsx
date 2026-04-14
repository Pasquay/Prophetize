import { Image, Text, View } from 'react-native';
import { useUserStore } from '@/context/useUserStore';
import { UI_COLORS, UI_SHADOWS } from '@/constants/ui-tokens';

type MarketDetailBalanceProps = {
    balanceOverride?: number | null;
};

export default function MarketDetailBalance({ balanceOverride = null }: MarketDetailBalanceProps) {
    const {userData} = useUserStore();
    const balance = Number(
        typeof balanceOverride === 'number' ? balanceOverride : (userData?.balance ?? 0)
    );

    return(
        <View
            className="self-start flex-row items-center gap-2 rounded-full px-4 py-2 border-[1px]"
            style={{
                backgroundColor: UI_COLORS.surface,
                borderColor: UI_COLORS.border,
                ...UI_SHADOWS.soft,
            }}
        >
            <Image
                source={require('../../assets/app-icons/p-coin.png')}
                style={{ width: 22, height: 22 }}
                resizeMode="contain"
            />
            <Text className="font-jetbrain-bold text-lg" style={{ color: UI_COLORS.textPrimary }}>
                {balance.toLocaleString()}
            </Text>
        </View>
    )
}
