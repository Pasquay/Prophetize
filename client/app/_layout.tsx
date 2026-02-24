import "../global.css";
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { SpaceGrotesk_700Bold, SpaceGrotesk_400Regular } from '@expo-google-fonts/space-grotesk';
import { InterTight_400Regular, InterTight_700Bold } from '@expo-google-fonts/inter-tight';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';


export default function Layout() {

  const router = useRouter();

  useEffect(() => {
    const checkToken = async () => {
        const token = await SecureStore.getItemAsync('access_token');
        if (token) {
            router.replace('/home');
        }
    };
    checkToken();
}, []); 

  const [fontsLoaded] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_700Bold,
    InterTight_400Regular,
    InterTight_700Bold,
  });

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Prophetize', headerShown: false }} />
      <Stack.Screen name="login" options={{ title: 'Login', headerShown: false }} />
      <Stack.Screen name="signUp" options={{ title: 'signUp', headerShown: false }} />
      <Stack.Screen name="home" options={{ title: 'home', headerShown: false }} />
    </Stack>
  );
}