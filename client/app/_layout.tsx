import "../global.css";
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { SpaceGrotesk_700Bold, SpaceGrotesk_400Regular } from '@expo-google-fonts/space-grotesk';
import { InterTight_400Regular, InterTight_700Bold } from '@expo-google-fonts/inter-tight';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/loading-screen'

export default function Layout() {
    return (
        <AuthProvider>
            <RootLayout />
        </AuthProvider>
    );
}

function RootLayout() {
  const router = useRouter();
  const { token, isLoading } = useAuth();

  

  useEffect(() => {
    if(isLoading) return;
    if(token){
      router.replace('/home');
    } 
  }, [isLoading]);

  const [fontsLoaded] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_700Bold,
    InterTight_400Regular,
    InterTight_700Bold,
  });

  if(isLoading){
    return <LoadingScreen />
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Prophetize', headerShown: false }} />
      <Stack.Screen name="login" options={{ title: 'Login', headerShown: false }} />
      <Stack.Screen name="signUp" options={{ title: 'signUp', headerShown: false }} />
      <Stack.Screen name="home" options={{ title: 'home', headerShown: false }} />
    </Stack>
  );
}