import { Text, View, Pressable, Image, useWindowDimensions } from "react-native";
import { useRouter } from 'expo-router';
import Logo from "../components/logo-hint"
import Fontisto from '@expo/vector-icons/Fontisto';
import AntDesign from '@expo/vector-icons/AntDesign';
import WideButton from '../components/wide-button';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function welcomeScreen(){
    const { width, height } = useWindowDimensions();
    const router = useRouter();

    return (
        <SafeAreaView className="bg-[#F1F5F9] flex-1">
            <View className="flex-1 p-6">
            
                <View className="mt-[40px]">
                    <Logo />
                </View>

                <Image resizeMode="contain" className= "absolute right-0 top-40" source={require("../assets/app-icons/ledger.png")} style={{width: width * 0.3, height: height * 0.3}}></Image>

                <View className="flex-1 justify-end  gap-[12px]">
                    <Text className="text-[42px] font-grotesk-bold tracking-[-1.05px] text-[#0F172A] ">
                        Predict{"\n"}the future.
                    </Text>
                    <Text className="text-[18px] text-[#94A3B8] font-inter">
                        Trade virtual currency on real-world outcomes without the risk.
                    </Text>
                </View>

            </View>

            <View className="bg-[#F1F5F9] p-6 pb-40  gap-[12px]">

                <WideButton
                    onPress={() => router.push('/signUp')}
                    label="Continue with Email"
                    variant="primary"
                    icon={<Fontisto  name="email" size={24} color="white" />}
                />

                <WideButton 
                    onPress={() => null}
                    label="Continue with Google"
                    variant="secondary"
                    icon={<AntDesign name="google" size={24} color="black" />}
                />

                <Text className="top-36 text-center text-[12px] text-[#94A3B8] font-inter">
                    By continuing, you agree to our{" "}
                    <Text className="underline">Terms of Service</Text>
                    {" & "} 
                    <Text className="underline">Privacy Policy</Text>.
                </Text>

            </View>
        </SafeAreaView>
    )
}
