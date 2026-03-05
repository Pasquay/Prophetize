import React, { useEffect, useState } from 'react';
import { Text, View, Alert, ScrollView, Pressable } from 'react-native';
import TempAnim from "../../components/temp";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import WideButton from '../../components/wide-button'
import * as api from '../../utils/api';
import  { useAuth }  from '../../context/AuthContext';
import {Prediction} from "../../.expo/types/model";
import  PredictionCard from "../../components/prediction-card";
import CategoryBtn from "../../components/category-btn";
import LoadingScreen from '../../components/loading-screen';
import HomeHeader from "../../components/home-header";

export default function App() {

    const router = useRouter();
    const { token } = useAuth(); 

    const [predictions, setPrediction] = useState<Prediction[]>([]);
    const [activeCategory, setActiveCategory] = useState("get-all"); 
    const [marketsLoading, setMarketsLoading] = useState(false);
    const [userData, setUserData] = useState<{balance: number} | null>(null);

    const categories = [
        { label: "Trending", endpoint: "get-all" },
        { label: "Sports",   endpoint: "sports"   },
        { label: "Politics", endpoint: "politics" },
        { label: "Crypto",   endpoint: "crypto"   },
        { label: "School",   endpoint: "school"   },
    ];

    useEffect(() => {
        const getMarketData = async (endpoint:string) => {
            setMarketsLoading(true);
            const {ok, data} = await api.get("/markets/"+endpoint);
            console.log("Total predictions received:", data.length);
            if(ok){
                setPrediction(data.markets ?? []);
            } else {
                Alert.alert('Something wrong happened when fetching for predictions!');
            }
            setMarketsLoading(false);
        };
        getMarketData(activeCategory); 
    }, [activeCategory]);

    useEffect(() => {
        if (!token) return;
        const getUserData = async () => {
            const {ok, data} = await api.get("/auth/profile");
            if(ok){
                setUserData(data);
                console.log("ok:", ok);
                console.log("data:", JSON.stringify(data, null, 2));
            } else {
                console.log("Profile fetch failed:", data);
            }
        };
        getUserData();
    }, [token]);

    const goMarketDetails = (id:number) => {
        router.push({
            pathname: "../marketDetails",
            params: { id: id }
        });
    };

    return (
        <SafeAreaView className="flex-1 p-5 bg-[#F5F5F5]">
            <View className="gap-4">
                {/* <View className="flex-1 w-max justify-center   self-center">
                    <TempAnim />
                    <Text >Prophetize Beta</Text>
                </View> */}

                <HomeHeader balance={userData?.balance ?? 0}/>
                
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                    <View className="flex-row gap-2">
                        {categories.map((cat) => (
                            <CategoryBtn
                                key={cat.endpoint}
                                label={cat.label}
                                isActive={activeCategory === cat.endpoint}
                                onPress={() => setActiveCategory(cat.endpoint)}
                        />
                        ))}
                    </View>
                </ScrollView>

                {marketsLoading ? (
                    <LoadingScreen/>
                ):(
                    <ScrollView className="">
                        <View className="gap-[16px]">
                            {predictions.map((prediction) => (
                                <PredictionCard 
                                    key={prediction.id} 
                                    prediction={prediction} 
                                    onPress={() => goMarketDetails(prediction.id)}
                                />
                            ))}
                        </View>
                    </ScrollView>   
                )}
            </View>
        </SafeAreaView>
    );
}

