import React, { useEffect, useState } from 'react';
import { Text, View, Alert, ScrollView } from 'react-native';
import TempAnim from "../../components/temp";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import WideButton from '../../components/wide-button'
import * as api from '../../utils/api';
import  { useAuth }  from '../../context/AuthContext';
import {Prediction} from "../../.expo/types/model";
import  SituationCard from "../../components/situation-card";

export default function App() {

    const router = useRouter();
    const {logout, isLoading} = useAuth();

    const [predictions, setPrediction] = useState<Prediction[]>([]);

    useEffect(() => {
        const getData = async () => {
            const {ok, data} = await api.get("/markets/all");
            console.log("Total predictions received:", data.length);
            console.log("API Response:", JSON.stringify(data, null, 2)); // 👈 Add this
            if(ok){
                setPrediction(data.markets);
            } else {
                Alert.alert('Something wrong happened when fetching for predictions!');
            }
        };
        getData(); 
    }, []);



    const handleLogout = async () => {
        const endpoint = '/auth/logout';
        const ok = await api.post(endpoint, {});
        if (!ok){
            Alert.alert('Logout Failed');
            return;
        } 
        await logout();
        router.replace('/');
    }


    return (
        <SafeAreaView className="flex-1 p-2 bg-white">
            <View className="flex-1 w-max justify-center   self-center">
                <TempAnim />
            <Text >Prophetize Beta</Text>
            </View>

             <ScrollView >
                <View className="gap-[16px]">
                    {predictions.map((prediction) => (
                        <SituationCard key={prediction.id} prediction={prediction} />
                    ))}
                </View>
            </ScrollView>   

            <WideButton
                label='Logout'
                onPress={handleLogout}
                variant='primary'
                disabled={isLoading}
            />

        </SafeAreaView>
    );
}

