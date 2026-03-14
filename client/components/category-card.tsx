import React from 'react';
import { Pressable, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { categoryIconMap } from '@/constants/ui-mappings';

export type CategoryKey = 'SPORTS' | 'POLITICS' | 'CRYPTO' | 'CULTURE' | 'TECHNOLOGY' | 'SCHOOL';

type Props = {
    /** Category key (uppercase, e.g. "SPORTS") */
    categoryKey: string;
    /** Human-readable label e.g. "Sports" */
    label: string;
    /** Number of active markets in this category */
    count?: number;
    onPress: () => void;
};

export default function CategoryCard({ categoryKey, label, count, onPress }: Props) {
    const icon = categoryIconMap[categoryKey.toUpperCase()] ?? {
        name: 'help-outline' as keyof typeof MaterialIcons.glyphMap,
        color: '#94A3B8',
        bg: '#F8FAFC',
    };

    return (
        <Pressable
            onPress={onPress}
            className="flex-1 rounded-2xl overflow-hidden"
            style={{
                minHeight: 96,
                borderWidth: 1,
                borderColor: '#E2E8F0',
                backgroundColor: 'white',
            }}
        >
            <View className="flex-1 px-4 pt-4 pb-5 gap-3">
                {/* Icon badge */}
                <View
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        backgroundColor: icon.bg,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <MaterialIcons name={icon.name} size={20} color={icon.color} />
                </View>

                {/* Labels */}
                <View>
                    <Text
                        className="text-[#0F172A] font-grotesk-bold text-[14px]"
                        numberOfLines={1}
                    >
                        {label}
                    </Text>
                    {count !== undefined && (
                        <Text className="text-[#94A3B8] font-jetbrain text-[11px]">
                            {count} markets
                        </Text>
                    )}
                </View>
            </View>
        </Pressable>
    );
}
