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
import ClaimAllowance from "../../components/claim-allowance";

export default function App() {

    const router = useRouter();
    const { token } = useAuth(); 

    const [predictions, setPrediction] = useState<Prediction[]>([]);
    const [activeCategory, setActiveCategory] = useState("trending"); 
    const [marketsLoading, setMarketsLoading] = useState(false);
    const [userData, setUserData] = useState<{balance: number, last_claim_date: string | null} | null>(null);

    const canClaimAllowance = (() => {
        if (!userData) return false;
        if (!userData.last_claim_date) return true;
        const now = new Date();
        const last = new Date(userData.last_claim_date);
        return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) >
               Date.UTC(last.getUTCFullYear(), last.getUTCMonth(), last.getUTCDate());
    })();

    const categories = [
        { label: "Trending", endpoint: "trending"           },
        { label: "All",      endpoint: "get-all"          },
        { label: "Sports",   endpoint: "category/sports"   },
        { label: "Politics", endpoint: "category/politics" },
        { label: "Crypto",   endpoint: "category/crypto"   },
        { label: "School",   endpoint: "category/school"   },
    ];

    useEffect(() => {
        const getMarketData = async (endpoint:string) => {
            setMarketsLoading(true);
            const {ok, data} = await api.get("/markets/"+endpoint);
            console.log("Total predictions received:", data.length);
            if(ok){
                setPrediction(Array.isArray(data) ? data : (data.data ?? []));
            } else {
                Alert.alert('Something wrong happened when fetching for predictions!');
            }
            setMarketsLoading(false);
        };
        getMarketData(activeCategory); 
    }, [activeCategory]);

    const fetchUserData = async () => {
        const {ok, data} = await api.get("/auth/profile");
        if(ok){
            setUserData(data);
        } else {
            console.log("Profile fetch failed:", data);
        }
    };

    useEffect(() => {
        if (!token) return;
        fetchUserData();
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

                <HomeHeader balance={userData?.balance ?? 0}/>
                
                {canClaimAllowance && <ClaimAllowance onClaimed={fetchUserData}/>}

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

                {/* <View className="p"> */}
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
                {/* </View> */}
            </View>
        </SafeAreaView>
    );
}

