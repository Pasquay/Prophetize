import React, {useState} from 'react';
import { Text, View, Pressable, useWindowDimensions, Image, TextInput, Alert} from 'react-native';
import { useRouter } from 'expo-router';
import Logo from "../components/logo-hint"
import BackBtn from "../components/backbtn"
import AntDesign from '@expo/vector-icons/AntDesign';
import WideButton from '../components/wide-button';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as api from '../utils/api';
import InputField from '../components/input-field';



export default function signUpScreen() {
    const { width, height } = useWindowDimensions();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // For signup inputs
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    //Email Verifier 
    const emailRegex: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    function validateEmail(email:string): boolean {
        return emailRegex.test(email);
    }
    
    
    const handleSignUp = async () => {

        if(!email || !password || !username){
            Alert.alert('Please fill out all fields!');
            return;
        } 
        if(!validateEmail(email)){
            Alert.alert('Please enter a valid email!');
            return;
        }
        if(password.length < 6){
            Alert.alert('Please increase your password length!'); 
            return;
        }


        try{
            setLoading(true);
            const endpoint = '/auth/register';
            const { ok, data } = await api.post(endpoint, {username, email, password});
            if(ok){
                Alert.alert('Success');
                router.push('/login');
            } else {
                Alert.alert('Signup failed', data.error);
            }
        } catch (error) {
            console.error('Signup error:', error);
            Alert.alert('Network Error', 'Could not connect to the server.');
        } finally {
            setLoading(false);
        }
        
    }

    return (
        <SafeAreaView  className="bg-[#F5F5F5] flex-1">
            <View className="flex-1 p-6">

                <View className="flex flex-row gap-3 items-center">
                    <Pressable onPress={() => router.back()}>
                            <BackBtn size={24} color="#0F172A" />
                    </Pressable>
                    
                    <View className="">
                        <Logo />
                    </View>
                </View>

                <Image
                    resizeMode="contain"
                    className="absolute right-0 top-40"
                    source={require("../assets/app-icons/ledger.png")}
                    style={{ width: width * 0.3, height: height * 0.3 }}
                />

                <View className="flex-1 justify-end gap-[12px] mt-4">
                    <Text className="text-[42px] font-grotesk-bold tracking-[-2px] text-[#0F172A]">
                        Create {'\n'}an account
                    </Text>
                    <Text className="text-[18px] text-[#94A3B8] font-inter">
                        Start trading without the risk.
                    </Text>
                </View>
            </View>

            <View className="bg-[#F1F5F9] px-6 pt-6 pb-2 gap-3">
                <InputField
                    label="Username"
                    placeholder="John Doe"
                    placeholderTextColor="#94A3B8"
                    onChangeText={setUsername}
                    autoCapitalize="none"
                />

                <InputField
                    label="Email"
                    placeholder="example@gmail.com"
                    placeholderTextColor="#94A3B8"
                    keyboardType="email-address"
                    onChangeText={setEmail}
                    inputMode="email"
                    autoCapitalize="none"
                />

                <View className="gap-6">
                    <InputField
                        label="Password"
                        placeholder="••••••"
                        placeholderTextColor="#94A3B8"
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                        
                    <WideButton 
                        onPress={handleSignUp} 
                        label={ loading ? "Creating Account..." : "Create Account"}
                        variant="primary"
                        disabled={loading}
                    />
                </View>

                <View className="flex-row items-center gap-3">
                    <View className="flex-1 h-[1px] bg-slate-300" />
                    <Text className="text-slate-400 font-grotesk-bold-[13px]">or continue with</Text>
                    <View className="flex-1 h-[1px] bg-slate-300" />
                </View>

                <WideButton 
                    onPress={() => null}
                    label="Continue with Google"
                    variant="secondary"
                    icon={<AntDesign name="google" size={24} color="black" />}
                />

                <View className="flex-row items-center justify-center gap-1 mt-2">
                    <Text className="text-slate-400 font-grotesk-bold text-[14px]">Already have an account?</Text>
                    <Pressable onPress={() => router.push('/login')}>
                        <Text className="text-[#87CEEB] font-grotesk-bold text-[14px]">Log in</Text>
                    </Pressable>
                </View>

            </View>
        </SafeAreaView>
    );
}

