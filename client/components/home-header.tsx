import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

type Props = {
    balance: number;
    hasNotification?: boolean;
    onNotificationPress?: () => void;
}

export default function HomeHeader({ balance, hasNotification = true, onNotificationPress }: Props) {
    const formatted = balance.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    return (
        <View className="h-auto w-full flex-row items-center pb-4 gap-2">
            <View className="flex-row items-center gap-3 flex-1 p-2 inline-flex">
                <Image
                    source={require('../assets/app-icons/p-coin.png')}
                    style={{ width: 44, height: 44 }}
                    resizeMode="contain"
                />
                <Text
                    className="font-jetbrain-bold text-[30px] tracking-[-1px] text-[#0F172A]"
                    numberOfLines={1}
                    adjustsFontSizeToFit
                >
                    {formatted}
                </Text>
            </View>

            <Pressable
                onPress={onNotificationPress}
                style={{ padding: 8 }}
                className="rounded-full "
            >
                <View >
                    <Ionicons name="notifications-outline" size={26} color="#0F172A" />
                    {hasNotification && (
                        <View
                            style={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                width: 9,
                                height: 9,
                                borderRadius: 5,
                                backgroundColor: '#38BDF8',
                                borderWidth: 1.5,
                                borderColor: '#ffffff',                           }}
                        />
                    )}
                </View>
            </Pressable>
        </View>
    );
}
