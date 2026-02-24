import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button, Alert, TextInput, Pressable } from 'react-native';
import TempAnim from "../components/temp";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as api from '../utils/api';

export default function App() {

    const router = useRouter();

    const handleLogout = async () => {
        // const token = await SecureStore.getItemAsync('access_token');
        // const backendUrl = 'http://192.168.254.187:3001/auth/logout'
        const endpoint = '/auth/logout';

        const { ok, data} = await api.post(endpoint, {});

        // const response = await fetch(backendUrl, {
        //     method: 'POST',
        //     headers: {'Content-Type':'application/json', 'Authorization':`Bearer ${token}`}
        // });



        if (!ok){
            Alert.alert('Logout Failed');
            return;
        } 

        await SecureStore.deleteItemAsync('access_token');
        await SecureStore.deleteItemAsync('refresh_token');
        router.replace('/');
    }

    return (
        <SafeAreaView className="flex-1 p-2">
            <View className="flex-1 w-max justify-center   self-center">
                {/* <WalkingAnim />
                <LogoAnim /> */}
                <TempAnim />
            <Text >Prophetize Beta</Text>
            </View>

            <Pressable onPress={handleLogout} className="bg-slate-300 flex-row items-center justify-center p-4 rounded-2xl gap-[8px] border border-[#E2E8F0]">
                <Text className="font-grotesk-bold text-[16px]">Logout</Text>
            </Pressable>

        </SafeAreaView>
    );
}

