import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Text, View, Alert, ScrollView, FlatList } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import NoMarkets from "../../components/no-markets";
import * as api from '../../utils/api';
import  { useAuth }  from '../../context/AuthContext';
import {Prediction} from "../../.expo/types/model";
import  PredictionCard from "../../components/prediction-card";
import CategoryBtn from "../../components/category-btn";
import LoadingScreen from '../../components/loading-screen';
import HomeHeader from "../../components/home-header";
import ClaimAllowance from "../../components/claim-allowance";
import { useUserStore } from '../../context/useUserStore';
import categories from "../../constants/categories";
import { ExploreTheme } from "../../constants/explore-theme";

export default function HomeScreen() {

    const router = useRouter();
    const tabBarHeight = useBottomTabBarHeight();
    const { userData, fetchUserData } = useUserStore();

    const [predictions, setPrediction] = useState<Prediction[]>([]);
    const [activeCategory, setActiveCategory] = useState("trending"); 
    const [marketsLoading, setMarketsLoading] = useState(false);
    const [noMarket, setNoMarket] = useState(true);

    const canClaimAllowance = useMemo(() => {
        if (!userData) return false;
        if (!userData.last_claim_date) return true;
        const now = new Date();
        const last = new Date(userData.last_claim_date);
        return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) >
               Date.UTC(last.getUTCFullYear(), last.getUTCMonth(), last.getUTCDate());
    }, [userData]);

    useEffect(() => {
        const getMarketData = async (endpoint:string) => {
            setMarketsLoading(true);
            const {ok, data} = await api.get("/markets/"+endpoint);
            console.log("Total predictions received:", data.length);
            if(ok){
                setPrediction(Array.isArray(data) ? data.filter(i => i && i.id) : (Array.isArray(data.data) ? data.data.filter((i: any) => i && i.id) : []));
                if(data.length != 0){
                    setNoMarket(false);
                } else {
                    setNoMarket(true);
                }
            } else {
                Alert.alert('Something wrong happened when fetching for predictions!');
            }
            setMarketsLoading(false);
        };
        getMarketData(activeCategory); 
    }, [activeCategory]);

    const goMarketDetails = useCallback((id:number) => {
        router.push({ pathname: `../marketDetails`, params: {id} });
    }, [router]);


    return (
        <View className="flex-1" style={{ backgroundColor: ExploreTheme.pageBg }}>
            {/* White header zone — includes status bar */}
            <SafeAreaView edges={['top']} className="bg-white">
                <View className="px-5 pt-3 bg-white" style={{ borderBottomWidth: 1, borderBottomColor: ExploreTheme.headerBorder }}>
                    <HomeHeader balance={userData?.balance ?? 0}/>
                 </View>   
            </SafeAreaView>

            <View className="px-5 pt-3 gap-3">
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
            </View>

            {/* Scrollable content */}
            <View className="flex-1 px-5 pt-3">
                {marketsLoading ? (
                    <LoadingScreen/>
                ) : (
                    noMarket ? (
                        <NoMarkets/>
                    ) : (
                        <FlatList
                            data={predictions}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <PredictionCard 
                                    prediction={item} 
                                    onPress={() => goMarketDetails(item.id)}
                                />
                            )}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ gap: 14, paddingBottom: tabBarHeight + 16 }}
                        />       
                    )
                )}
            </View>
        </View>
    );
}

