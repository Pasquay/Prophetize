import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { ExploreTheme } from '@/constants/explore-theme';
import { UI_COLORS } from '@/constants/ui-tokens';

type Props = {
    balance: number;
    hasNotification?: boolean;
    onNotificationPress?: () => void;
}

function AnimatedBalance({ value }: { value: number }) {
    const [displayed, setDisplayed] = useState(value);
    const prevValue = useRef(value);
    const frameRef = useRef<number | null>(null);

    useEffect(() => {
        if (prevValue.current === value) return;

        const start = prevValue.current;
        const end = value;
        const duration = 600;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = start + (end - start) * eased;
            setDisplayed(current);

            if (progress < 1) {
                frameRef.current = requestAnimationFrame(animate);
            } else {
                prevValue.current = end;
            }
        };

        frameRef.current = requestAnimationFrame(animate);
        return () => {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, [value]);

    const formatted = displayed.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    return (
        <Text
            className="font-jetbrain-bold text-2xl tracking-[-1px]"
            numberOfLines={1}
            adjustsFontSizeToFit
            style={{ color: ExploreTheme.titleText }}
        >
            {formatted}
        </Text>
    );
}

export default function HomeHeader({ balance, hasNotification = true, onNotificationPress }: Props) {
    return (
        <View className="h-auto w-full flex-row items-center gap-2">
            <View className="flex-row items-center gap-3 flex-1 p-2 inline-flex">
                <Image
                    source={require('../../assets/app-icons/p-coin.png')}
                    style={{ width: 44, height: 44 }}
                    resizeMode="contain"
                />
                <AnimatedBalance value={balance} />
            </View>

            <Pressable
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onNotificationPress?.();
                }}
                hitSlop={10}
                accessibilityLabel="Notifications"
                accessibilityRole="button"
                accessibilityHint="Opens notifications"
                style={({ pressed }) => ({
                    padding: 12,
                    opacity: pressed ? 0.85 : 1,
                    transform: [{ scale: pressed ? 0.92 : 1 }],
                })}
                className="rounded-full"
            >
                <View>
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
                                borderColor: UI_COLORS.surface,
                            }}
                        />
                    )}
                </View>
            </Pressable>
        </View>
    );
}
