import { Redirect, Tabs, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
import { useAuth } from '../../context/AuthContext';
import { useUserStore } from "../../context/useUserStore";
import { UI_COLORS } from '@/constants/ui-tokens';


export default function TabsLayout(){
  const { token, isLoading } = useAuth();
  const router = useRouter();
  const { fetchUserData } = useUserStore();

  useEffect(() => {
    if (isLoading) return;
    if (!token) {
            router.replace('/');
    } else {
        fetchUserData();
    }
  }, [token, isLoading]);

    if (!token && !isLoading) {
        return <Redirect href="/" />;
    }

    if (!token) return null;

  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: UI_COLORS.accent }}>
        <Tabs.Screen name="home" options={{ 
            title: 'Home', 
            headerShown: false, 
            tabBarIcon: ({color, size}) => {
                return <MaterialIcons name="home-filled" size={size} color={color} />
            }   
        }} />
        <Tabs.Screen name="explore" options={{ 
            title: 'Explore', 
            headerShown: false, 
            tabBarIcon: ({color, size}) => {
                return <Ionicons name="search" size={size} color={color} />
            }   
        }} />
        <Tabs.Screen name="leaderboard" options={{ 
            title: 'Leaderboard', 
            headerShown: false, 
            tabBarIcon: ({color, size}) => {
                return <MaterialIcons name="leaderboard" size={size} color={color} />
            }   
        }} />
        <Tabs.Screen name="profile" options={{ 
            title: 'Profile', 
            headerShown: false, 
            tabBarIcon: ({color, size}) => {
                return <Feather name="user" size={size} color={color} />
            }   
        }} />
        {/* <Tabs.Screen name="marketDetails" options={{
            href:null,
            headerShown:false,
        }} /> */}
    </Tabs>
  );
}
