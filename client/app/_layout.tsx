import "../global.css";
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { SpaceGrotesk_700Bold, SpaceGrotesk_400Regular } from '@expo-google-fonts/space-grotesk';
import { InterTight_400Regular, InterTight_700Bold } from '@expo-google-fonts/inter-tight';


export default function Layout() {

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
    </Stack>
  );
}