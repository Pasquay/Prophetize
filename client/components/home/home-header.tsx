import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ExploreTheme } from '@/constants/explore-theme';
import { UI_COLORS } from '@/constants/ui-tokens';

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
        <View className="h-auto w-full flex-row items-center gap-2">
            <View className="flex-row items-center gap-3 flex-1 p-2 inline-flex">
                <Image
                    source={require('../../assets/app-icons/p-coin.png')}
                    style={{ width: 44, height: 44 }}
                    resizeMode="contain"
                />
                <Text
                    className="font-jetbrain-bold text-2xl tracking-[-1px]"
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    style={{ color: ExploreTheme.titleText }}
                >
                    {formatted}
                </Text>
            </View>

            <Pressable
                onPress={onNotificationPress}
                hitSlop={10}
                accessibilityLabel="Notifications"
                accessibilityRole="button"
                accessibilityHint="Opens notifications"
                style={({ pressed }) => ({
                    padding: 12,  // Increased to ensure 44px+ touch target (26px icon + 24px padding)
                    opacity: pressed ? 0.85 : 1,
                    transform: [{ scale: pressed ? 0.92 : 1 }],
                })}
                className="rounded-full"
            >
                <View >
                    <Ionicons name="notifications-outline" size={26} color={ExploreTheme.titleText} />
                    {hasNotification && (
                        <View
                            style={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                width: 9,
                                height: 9,
                                borderRadius: 5,
                                backgroundColor: UI_COLORS.accent,
                                borderWidth: 1.5,
                                borderColor: UI_COLORS.surface,                           }}
                        />
                    )}
                </View>
            </Pressable>
        </View>
    );
}
