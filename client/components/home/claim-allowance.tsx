import React, {useState} from 'react';
import {View, Pressable, Text, Alert} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as api from '@/utils/api';
import AnimatedIcon from "./animated-gift";
import { UI_COLORS } from '@/constants/ui-tokens';


export default function ClaimAllowance({ onClaimed }: { onClaimed?: () => void }) {

    const claimAllowance = async () => {
        const {ok, data} = await api.post('/auth/claim-allowance');
        if(ok){
            Alert.alert('Success', `You received ${data.reward} P-coins! (Day ${data.streakDay})`);
            onClaimed?.();
        } else {
            Alert.alert('Error', data.error || 'Something wrong happened.');
        }
    }

    return (
        <View className="">
            <View
                className="rounded-xl h-auto p-4 border-[1px] flex-row gap-3 items-center"
                style={{ backgroundColor: UI_COLORS.surface, borderColor: UI_COLORS.border }}
            >
                <View className="w-13 h-13 rounded-full p-3 inline-flex z-0 items-center" style={{ backgroundColor: UI_COLORS.accentSoft }}>
                    <MaterialCommunityIcons name="gift-outline" size={24} color={UI_COLORS.accent} />
                    {/* <AnimatedIcon /> */}
                </View>
                <View className="flex-col">
                    <Text className="font-grotesk-bold text-[14px] ">Daily Login Bonus</Text>
                    <Text className="font-jetbrain text-[12px]" style={{ color: UI_COLORS.textSecondary }}>+15 P-coins</Text>
                </View>
                <View className="flex-1"/>
                <Pressable
                    onPress={claimAllowance}
                    hitSlop={14}
                    style={({ pressed }) => ({
                        opacity: pressed ? 0.7 : 1,
                        transform: [{ scale: pressed ? 0.98 : 1 }],
                    })}
                >
                    <Text className="font-grotesk-bold text-l" style={{ color: UI_COLORS.accent }}>Claim</Text>
                </Pressable>
            </View>
        </View>
    )
}
