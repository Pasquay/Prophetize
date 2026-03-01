import { Text, View, Pressable, Image, useWindowDimensions } from "react-native";
import { useRouter } from 'expo-router';
import Logo from "../components/logo-hint"
import Fontisto from '@expo/vector-icons/Fontisto';
import WideButton from '../components/wide-button';
import { SafeAreaView } from 'react-native-safe-area-context';
import GoogleLogin from "../components/google-login";


export default function welcomeScreen(){
    const { width, height } = useWindowDimensions();
    const router = useRouter();

    return (
        <SafeAreaView className="bg-[#F5F5F5] flex-1 ">
            <View className="flex-1 p-6 ">
            
                <View className="mt-[40px]">
                    <Logo />
                </View>

                <Image resizeMode="contain" className= "absolute right-0 top-40" source={require("../assets/app-icons/ledger.png")} style={{width: width * 0.3, height: height * 0.3}}></Image>

                <View className="flex-1 justify-center gap-[12px] ">
                    <Text className="text-[52px] font-grotesk-bold tracking-[-1.05px] text-[#0F172A] ">
                        Predict{"\n"}the future.
                    </Text>
                    <Text className="text-[18px] text-[#94A3B8] font-inter">
                        Trade virtual currency on real-world {'\n'} outcomes without the risk.
                    </Text>
                </View>

            </View>

            <View className="bg-[#F5F5F5] p-6  gap-[12px]">

                <WideButton
                    onPress={() => router.push('/signUp')}
                    label="Continue with Email"
                    variant="primary"
                    icon={<Fontisto  name="email" size={24} color="white" />}
                />

                {/* <WideButton 
                    onPress={() => null}
                    label="Continue with Google"
                    variant="secondary"
                    icon={<AntDesign name="google" size={24} color="black" />}
                /> */}

                <GoogleLogin></GoogleLogin>

                <Text className=" text-center text-[12px] text-[#94A3B8] font-inter">
                    By continuing, you agree to our{" "}
                    <Text className="underline">Terms of Service</Text>
                    {" & "} 
                    <Text className="underline">Privacy Policy</Text>.
                </Text>

            </View>
        </SafeAreaView>
    )
}
