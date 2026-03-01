import { Tabs } from 'expo-router';
import React from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';

export default function layout(){
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor:"#90E0EF", animation:"shift" }}>
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
    </Tabs>
  );
}