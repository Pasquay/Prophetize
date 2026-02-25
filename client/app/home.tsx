import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button, Alert, TextInput, Pressable } from 'react-native';
import TempAnim from "../components/temp";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import WideButton from '../components/wide-button'
import * as api from '../utils/api';
import  { useAuth }  from '../context/AuthContext';

export default function App() {

    const router = useRouter();
    const {logout, isLoading} = useAuth();

    const handleLogout = async () => {
        const endpoint = '/auth/logout';
        const ok = await api.post(endpoint, {});
        if (!ok){
            Alert.alert('Logout Failed');
            return;
        } 
        await logout();
        router.replace('/');
    }

    return (
        <SafeAreaView className="flex-1 p-2">
            <View className="flex-1 w-max justify-center   self-center">
                <TempAnim />
            <Text >Prophetize Beta</Text>
            </View>

            <WideButton
                label='Logout'
                onPress={handleLogout}
                variant='primary'
                disabled={isLoading}
            />

        </SafeAreaView>
    );
}

