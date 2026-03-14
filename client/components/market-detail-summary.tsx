import React, { useEffect, useState } from 'react';
import { Image, Text, View } from 'react-native';
import { Prediction } from '../.expo/types/model';

interface Props {
    prediction: Prediction;
    userPosition?: number | null;
    userPL?: number | null;
}

function formatCountdown(endDate: string): string {
    const now = new Date();
    const end = new Date(endDate);
    const diffMs = end.getTime() - now.getTime();
    if (diffMs <= 0) return 'Ended';
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${days}d  ${String(hours).padStart(2, '0')}h  ${String(mins).padStart(2, '0')}m`;
}

const PCoin = () => (
    <Image
        source={require('../assets/app-icons/p-coin.png')}
        style={{ width: 18, height: 18 }}
        resizeMode="contain"
    />
);

export default function MarketDetailSummary({ prediction, userPosition = null, userPL = null }: Props) {
    const [countdown, setCountdown] = useState(() => formatCountdown(prediction.endDate));

    useEffect(() => {
        const interval = setInterval(() => {
            setCountdown(formatCountdown(prediction.endDate));
        }, 60000);
        console.log(prediction);
        return () => clearInterval(interval);
    }, [prediction.endDate]);

    const hasPL = userPL !== null && userPL !== undefined;

    return (
        <View
            className="mx-4 rounded-2xl bg-white overflow-hidden"
            style={{
                shadowColor: '#CBD5E1',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.5,
                shadowRadius: 8,
                elevation: 3,
                borderWidth: 1,
                borderColor: '#EEF2F7',
            }}
        >
            {/* Row 1 */}
            <View className="flex-row" style={{ borderBottomWidth: 1, borderBottomColor: '#EEF2F7' }}>
                {/* VOLUME */}
                <View className="flex-1 p-4" style={{ borderRightWidth: 1, borderRightColor: '#EEF2F7' }}>
                    <Text
                        className="text-[10px] tracking-widest mb-2"
                        style={{ color: '#94A3B8', fontFamily: 'InterTight_700Bold' }}
                    >
                        VOLUME
                    </Text>
                    <View className="flex-row items-center gap-1.5">
                        <PCoin />
                        <Text
                            className="text-base"
                            style={{ color: '#0D1117', fontFamily: 'JetBrainsMono_700Bold' }}
                        >
                            {(prediction.total_volume ?? 0).toLocaleString()}
                        </Text>
                    </View>
                </View>

                {/* EXPIRATION */}
                <View className="flex-1 p-4">
                    <Text
                        className="text-[10px] tracking-widest mb-2"
                        style={{ color: '#94A3B8', fontFamily: 'InterTight_700Bold' }}
                    >
                        EXPIRATION
                    </Text>
                    <Text
                        className="text-base"
                        style={{ color: '#0D1117', fontFamily: 'JetBrainsMono_700Bold' }}
                    >
                        {countdown}
                    </Text>
                </View>
            </View>

            {/* Row 2 */}
            <View className="flex-row">
                {/* YOUR POSITION */}
                <View className="flex-1 p-4" style={{ borderRightWidth: 1, borderRightColor: '#EEF2F7' }}>
                    <Text
                        className="text-[10px] tracking-widest mb-2"
                        style={{ color: '#94A3B8', fontFamily: 'InterTight_700Bold' }}
                    >
                        YOUR POSITION
                    </Text>
                    <View className="flex-row items-center gap-1.5">
                        <PCoin />
                        <Text
                            className="text-base"
                            style={{ color: '#0D1117', fontFamily: 'JetBrainsMono_700Bold' }}
                        >
                            {userPosition !== null ? userPosition!.toFixed(2) : '0.00'}
                        </Text>
                    </View>
                </View>

                {/* P/L */}
                <View className="flex-1 p-4">
                    <Text
                        className="text-[10px] tracking-widest mb-2"
                        style={{ color: '#94A3B8', fontFamily: 'InterTight_700Bold' }}
                    >
                        P/L
                    </Text>
                    <Text
                        className="text-base"
                        style={{
                            fontFamily: 'JetBrainsMono_700Bold',
                            color: !hasPL ? '#CBD5E1' : userPL! >= 0 ? '#22C55E' : '#EF4444',
                        }}
                    >
                        {!hasPL ? '--' : (userPL! >= 0 ? '+' : '') + userPL!.toFixed(2)}
                    </Text>
                </View>
            </View>
        </View>
    );
}
