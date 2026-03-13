import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Image } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

type Props = {
    balance: number;
    hasNotification?: boolean;
    onNotificationPress?: () => void;
    onSearchChange?: (text: string) => void;
    onSearchSubmit?: (text: string) => void;
};

export default function SearchHeader({
    balance,
    hasNotification = false,
    onNotificationPress,
    onSearchChange,
    onSearchSubmit,
}: Props) {
    const [query, setQuery] = useState('');

    const formatted = balance.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    const handleChange = (text: string) => {
        setQuery(text);
        onSearchChange?.(text);
    };

    return (
        <View className="gap-3">
            {/* Balance row */}
            <View className="flex-row items-center pb-1 gap-2">
                <View className="flex-row items-center gap-3 flex-1 inline-flex">
                    <Image
                        source={require('../assets/app-icons/p-coin.png')}
                        style={{ width: 36, height: 36 }}
                        resizeMode="contain"
                    />
                    <Text
                        className="font-jetbrain-bold text-[26px] tracking-[-1px] text-[#0F172A]"
                        numberOfLines={1}
                        adjustsFontSizeToFit
                    >
                        {formatted}
                    </Text>
                </View>

                <Pressable
                    onPress={onNotificationPress}
                    style={{ padding: 8 }}
                    className="rounded-full"
                >
                    <View>
                        <Ionicons name="notifications-outline" size={24} color="#0F172A" />
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
                                    borderColor: '#ffffff',
                                }}
                            />
                        )}
                    </View>
                </Pressable>
            </View>

            {/* Search bar */}
            <View
                className="flex-row items-center rounded-xl px-3 gap-2"
                style={{
                    backgroundColor: '#F8FAFC',
                    borderWidth: 1,
                    borderColor: '#E2E8F0',
                    height: 48,
                }}
            >
                <Ionicons name="search-outline" size={20} color="#94A3B8" />
                <TextInput
                    value={query}
                    onChangeText={handleChange}
                    onSubmitEditing={() => onSearchSubmit?.(query)}
                    placeholder="Search markets…"
                    placeholderTextColor="#CBD5E1"
                    returnKeyType="search"
                    className="flex-1 text-[#0F172A] font-jetbrain text-[14px]"
                    style={{ paddingVertical: 0 }}
                />
                {query.length > 0 && (
                    <Pressable
                        onPress={() => {
                            setQuery('');
                            onSearchChange?.('');
                        }}
                        hitSlop={8}
                    >
                        <Ionicons name="close-circle" size={18} color="#94A3B8" />
                    </Pressable>
                )}
            </View>
        </View>
    );
}
