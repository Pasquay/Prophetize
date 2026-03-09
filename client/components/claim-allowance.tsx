import React, {useState} from 'react';
import {View, Pressable, Text, Alert} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as api from '../utils/api';
import AnimatedIcon from "./animated-gift";


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
            <View className="rounded-xl bg-white h-auto p-4 border-[#E2E8F0] border-[1px] flex-row gap-3 items-center">
                <View className="w-13 h-13 rounded-full p-3 bg-[#2563eb1a] inline-flex z-0 items-center">
                    <MaterialCommunityIcons name="gift-outline" size={24} color="#2563EB" />
                    {/* <AnimatedIcon /> */}
                </View>
                <View className="flex-col">
                    <Text className="font-grotesk-bold text-[14px] ">Daily Login Bonus</Text>
                    <Text className="font-jetbrain text-[12px] text-[#94A3B8]">+100 P-coins</Text>
                </View>
                <View className="flex-1"/>
                <Pressable onPress={claimAllowance}>
                    <Text className="font-grotesk-bold text-l text-[#2563EB]">Claim</Text>
                </Pressable>
            </View>
        </View>
    )
}