import React, {useState} from 'react';
import { Text, View, Pressable, useWindowDimensions, Image, TextInput, Alert} from 'react-native';
import { useRouter } from 'expo-router';
import Logo from "../components/logo-hint"
import BackBtn from "../components/backbtn"
import WideButton from '../components/wide-button';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as api from '../utils/api';
import  { useAuth }  from '../context/AuthContext';
import InputField from '../components/input-field';
import GoogleLogin from "../components/google-login";

export default function loginScreen() {
    const { width, height } = useWindowDimensions();
    const router = useRouter();

    // For login inputs
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const {login} = useAuth();

    const handleLogin = async () => {
        if(!email || !password){
            Alert.alert('Please input all fields!');
            return;
        }
        
        try{
            setLoading(true);
            const { ok, data } = await api.post('/auth/login', {email, password});
            if(ok){
                // Alert.alert('success');
                await login(data.user, data.session.access_token, data.session.refresh_token);
                router.push('./tabs/home');
            } else {
                Alert.alert('Failed to log in', data.error);
            }
        } catch(error){
            console.error('Signup error:', error);
            Alert.alert('Network Error', 'Could not connect to the server.');
        } finally {
            setLoading(false);
        }

    }

    return (
        <SafeAreaView className="bg-[#F5F5F5] flex-1" edges={['top']} >
        
            <View className="flex-1 p-6 ">
                <View className="flex flex-row gap-3 items-center">
                    <Pressable onPress={() => router.back()}>
                            <BackBtn size={24} color="#0F172A" />
                    </Pressable>
                    
                    <View className="">
                        <Logo />
                    </View>
                </View>


                <View className="absolute right-0 top-40" pointerEvents="none">
                    <Image
                        resizeMode="contain"
                        source={require("../assets/app-icons/ledger.png")}
                        style={{ width: width * 0.3, height: height * 0.3 }}
                    />
                </View>
                <View className="flex-1 justify-end">
                    <Text className="text-[42px] font-grotesk-bold tracking-[-2px] text-[#0F172A]">
                        Welcome {'\n'}back.
                    </Text>
                    <Text className="text-[18px] text-[#94A3B8] font-inter">
                        Continue your predictions on real-world outcomes.
                    </Text>
                </View>
            </View>

            <View className="bg-[#F1F5F9] p-6 gap-4">

                <InputField
                    label="Email"
                    placeholder="name@example.com"
                    keyboardType="email-address"
                    placeholderTextColor="#94A3B8"
                    onChangeText={setEmail}
                    autoCapitalize="none"
                />

                <InputField
                    label="Password"
                    placeholder="••••••"
                    placeholderTextColor="#94A3B8"
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <Pressable className="self-end">
                    <Text className="text-[#87CEEB] font-inter text-[14px]">Forgot Password?</Text>
                </Pressable>

                <WideButton 
                    onPress={handleLogin}
                    label={loading ? "Logging in..." : "Log in"}
                    variant="primary"
                    disabled={loading}
                />

                <View className="flex-row items-center gap-3">
                    <View className="flex-1 h-[1px] bg-slate-300" />
                    <Text className="text-slate-400 font-inter text-[13px]">or</Text>
                    <View className="flex-1 h-[1px] bg-slate-300" />
                </View>

                {/* <WideButton 
                    onPress={() => null}
                    label="Continue with Google"
                    variant="secondary"
                    icon={<AntDesign name="google" size={24} color="black" />}
                /> */}

                <GoogleLogin></GoogleLogin>

                <View className="flex-row items-center justify-center gap-1">
                    <Text className="text-slate-400 font-grotesk-bold text-[14px]">Don't have an account?</Text>
                    <Pressable onPress={() => router.push('/signUp')}>
                        <Text className="text-[#87CEEB] font-grotesk-bold text-[14px]">Sign Up</Text>
                    </Pressable>
                </View>
            </View>

        </SafeAreaView>
    );
}

