import {
  GoogleSignin,
  statusCodes,
  isSuccessResponse
} from '@react-native-google-signin/google-signin'
import { supabase } from '../utils/supabase'
import { Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { Pressable, View, Text } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useRouter } from 'expo-router';

const googleID = process.env.EXPO_PUBLIC_GOOGLECLIENT_ID as string;

type Props = {
  disabled?: boolean;
}


export default function GoogleLogin({disabled}:Props) {
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: googleID,
    });
  }, []);

  const [pressed, setPressed] = useState(false);
  const router = useRouter();
  return (
      <Pressable
        disabled={disabled}
        onPressIn={()=>setPressed(true)}
        onPressOut={()=>setPressed(false)}
        className={`flex-row items-center justify-center p-4 rounded-full gap-[8px]`}
        style={{
            opacity: pressed ? 0.7 : 1,
            backgroundColor: pressed ? '#e2e8f0' : '#ffffff',
            borderWidth: 1,
            borderColor: '#E2E8F0'
        }}
        onPress={async () => {
          try {
            await GoogleSignin.hasPlayServices()
            const response = await GoogleSignin.signIn()
            if (isSuccessResponse(response)) {
              const { data, error } = await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: response.data.idToken as string,
              })
              router.replace('./tabs/home');
              // console.log(error, data);
            }
          } catch (error: any) {
            if (error.code === statusCodes.IN_PROGRESS) {
              // operation (e.g. sign in) is in progress already
              Alert.alert('Already in progress!');
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
              // play services not available or outdated
              Alert.alert('Google Play services outdated! Cannot proceed with Google login.');
            } else {
              // some other error happened
              console.error("Google Sign-In Error Detail:", error); 
              Alert.alert('Error', error.message || 'Something went wrong');
            }
          }
        }}>
        <AntDesign name="google" size={24} color="black" />
        <Text className="text-[#0F172A] font-grotesk-bold text-[18px]">
              Continue with Google
        </Text>
      </Pressable>
  )
}

