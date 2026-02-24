import React, {useState} from 'react';
import { Text, View, Pressable, useWindowDimensions, Image, TextInput, Alert} from 'react-native';
import { useRouter } from 'expo-router';
import Logo from "../components/logo-hint"
import BackBtn from "../components/backbtn"
import AntDesign from '@expo/vector-icons/AntDesign';

export default function signUpScreen() {
    const { width, height } = useWindowDimensions();
    const router = useRouter();


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
        if(!email || !password){
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

            const backendUrl = 'https://:3001/api/register'

            const response = await fetch(backendUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({username, email, password})
            });

            const data = await response.json();

            if(response.ok){
                Alert.alert('Success');
                router.push('/home');
            } else {
                Alert.alert('Signup failed', data.message);
            }
        } catch (error) {
            console.error('Signup error:', error);
            Alert.alert('Network Error', 'Could not connect to the server.');
        }
        
    }

    return (
        <View className="bg-[#F1F5F9] flex-1">

            <View className="flex-1 p-6">

                <Pressable
                    onPress={() => router.back()}
                    className="mt-2 w-[44px] h-[44px] items-center justify-center rounded-full"
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
                        Create {'\n'}an account
                    </Text>
                    <Text className="text-[18px] text-[#94A3B8] font-inter">
                        Start trading without the risk.
                    </Text>
                </View>
            </View>

            <View className="bg-[#F1F5F9] px-6 pt-6 pb-6 gap-3">
                <View className="gap-1">
                    <Text className="font-grotesk-bold text-base text-[#0F172A]">Username</Text>
                    <View className="flex-row items-center gap-3 p-4 rounded-2xl bg-white border-2 border-slate-300">
                        
                        <TextInput
                            className="flex-1 text-slate-400 font-inter text-[16px] outline-none"
                            placeholder="Username"
                            placeholderTextColor="#94A3B8"
                            onChangeText={setUsername}
                            autoCapitalize="none"
        
                        />
                    </View>
                </View>
                <View className="gap-1">
                    <Text className="font-grotesk-bold text-base text-[#0F172A]">Email</Text>
                    <View className="flex-row items-center gap-3 p-4 rounded-2xl bg-white border-2 border-slate-300">
                        <TextInput
                            className="flex-1 text-slate-400 font-inter text-[16px] outline-none"
                            placeholder="Email address"
                            placeholderTextColor="#94A3B8"
                            keyboardType="email-address"
                            onChangeText={setEmail}
                            inputMode="email"
                            autoCapitalize="none"
                        />
                    </View>
                </View>

                <View className="gap-1">
                    <Text className="font-grotesk-bold text-base text-[#0F172A]">Password</Text>
                    <View className="flex-row items-center gap-3 p-4 rounded-2xl bg-white border-2 border-slate-300">
                        <TextInput
                            className="flex-1 text-slate-400 font-inter text-[16px] outline-none"
                            placeholder="Password"
                            placeholderTextColor="#94A3B8"
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>
                </View>

                <Pressable onPress={handleSignUp} className="bg-[#87CEEB] flex-row items-center justify-center gap-2 p-4 rounded-2xl mt-4">
                    <Text className="text-white font-grotesk-bold text-[18px]">Create Account</Text>
                </Pressable>

                <View className="flex-row items-center gap-3">
                    <View className="flex-1 h-[1px] bg-slate-300" />
                    <Text className="text-slate-400 font-grotesk-bold-[13px]">Or continue with</Text>
                    <View className="flex-1 h-[1px] bg-slate-300" />
                </View>

                <Pressable className="flex-row items-center justify-center gap-3 p-4 rounded-2xl bg-white border border-slate-200">
                    <AntDesign name="google" size={22} color="black" />
                    <Text className="font-grotesk-bold text-[16px] text-[#0F172A]">Google</Text>
                </Pressable>

                <View className="flex-row items-center justify-center gap-1 mt-2">
                    <Text className="text-slate-400 font-grotesk-bold text-[14px]">Already have an account?</Text>
                    <Pressable onPress={() => router.push('/login')}>
                        <Text className="text-[#87CEEB] font-grotesk-bold text-[14px]">Log in</Text>
                    </Pressable>
                </View>

            </View>
        </View>
    );
}

