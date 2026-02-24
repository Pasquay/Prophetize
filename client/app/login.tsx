import React, {useState} from 'react';
import { Text, View, Pressable, useWindowDimensions, Image, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Logo from "../components/logo-hint"
import BackBtn from "../components/backbtn"
import AntDesign from '@expo/vector-icons/AntDesign';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import * as api from '../utils/api';

export default function loginScreen() {
    const { width, height } = useWindowDimensions();
    const router = useRouter();

    // For login inputs
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        if(!email || !password){
            Alert.alert('Please input all fields!');
            return;
        }
        
        try{

            // const token = await SecureStore.getItemAsync('access_token');

            // fetch('/some-protected-route', {
            //     headers: { 'Authorization': `Bearer ${token}` }
            // });

            const endpoint = '/auth/login';

            const { ok, data } = await api.post(endpoint, {email, password});

            if(ok){
                Alert.alert('success');
                await SecureStore.setItemAsync('access_token', data.session.access_token);
                await SecureStore.setItemAsync('refresh_token', data.session.refresh_token);
                router.push('/home');
            } else {
                Alert.alert('Failed to log in', data.message);
            }
        } catch(error){
            console.error('Signup error:', error);
            Alert.alert('Network Error', 'Could not connect to the server.');
        }

    }

    return (
        <SafeAreaView className="bg-[#F1F5F9] flex-1">

            <View className="flex-1 p-6">
                
                <Pressable
                    onPress={() => router.back()}
                        className="mt-2 w-[44px] h-[44px] items-center justify-center rounded-full "
                    >
                        <BackBtn size={28} color="#0F172A" />
                </Pressable>
                
                <View className="mt-4">
                    <Logo />
                </View>

                <Image
                    resizeMode="contain"
                    className="absolute right-0 top-40"
                    source={require("../assets/app-icons/ledger.png")}
                    style={{ width: width * 0.3, height: height * 0.3 }}
                />

                <View className="flex-1 justify-end gap-[12px]">
                    <Text className="text-[42px] font-grotesk-bold tracking-[-1.05px] text-[#0F172A]">
                        Welcome {'\n'}back.
                    </Text>
                    <Text className="text-[18px] text-[#94A3B8] font-inter">
                        Continue your predictions on real-world outcomes.
                    </Text>
                </View>
            </View>

            <View className="bg-[#F1F5F9] px-6 pt-6 pb-2 gap-4">

                <View className="gap-2">
                    <Text className="font-grotesk-bold text-base text-[#0F172A]">Email</Text>
                    <TextInput
                        className="text-slate-400 font-inter text-[16px] p-4 rounded-2xl bg-white outline-none border-slate-300 border-2"
                        placeholder="name@example.com"
                        keyboardType="email-address"
                        placeholderTextColor="#94A3B8"
                        onChangeText={setEmail}
                        autoCapitalize="none"
                    />
                </View>

                <View className="gap-2">
                    <Text className="font-grotesk-bold text-base text-[#0F172A]">Password</Text>
                    <TextInput
                        className="text-slate-400 font-inter text-[16px] p-4 rounded-2xl bg-white outline-none border-slate-300 border-2"
                        placeholder="••••••••"
                        placeholderTextColor="#94A3B8"
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                </View>

                <Pressable className="self-end">
                    <Text className="text-[#87CEEB] font-inter text-[14px]">Forgot Password?</Text>
                </Pressable>

                <Pressable onPress={handleLogin} className="bg-[#87CEEB] items-center justify-center p-4 rounded-2xl">
                    <Text className="text-white font-grotesk-bold text-[18px]">Log In</Text>
                </Pressable>

                <View className="flex-row items-center gap-3">
                    <View className="flex-1 h-[1px] bg-slate-300" />
                    <Text className="text-slate-400 font-inter text-[13px]">OR</Text>
                    <View className="flex-1 h-[1px] bg-slate-300" />
                </View>

                <Pressable className="flex-row items-center justify-center gap-3 p-4 rounded-2xl bg-white border border-slate-200">
                    <AntDesign name="google" size={22} color="black" />
                    <Text className="font-grotesk-bold text-[16px] text-[#0F172A]">Continue with Google</Text>
                </Pressable>

                <View className="flex-row items-center justify-center gap-1 mt-2">
                    <Text className="text-slate-400 font-grotesk-bold text-[14px]">Don't have an account?</Text>
                    <Pressable onPress={() => router.push('/signUp')}>
                        <Text className="text-[#87CEEB] font-grotesk-bold text-[14px]">Sign Up</Text>
                    </Pressable>
                </View>

            </View>
        </SafeAreaView>
    );
}

