import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Text, View, Alert, ScrollView, FlatList } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import NoMarkets from "@/components/home/no-markets";
import * as api from '../../utils/api';
import {Prediction} from "../../.expo/types/model";
import  PredictionCard from "@/components/explore/prediction-card";
import CategoryBtn from "@/components/home/category-btn";
import HomeHeader from "@/components/home/home-header";
import ClaimAllowance from "@/components/home/claim-allowance";
import HomeListSkeleton from '@/components/home/home-list-skeleton';
import { useUserStore } from '../../context/useUserStore';
import { PortfolioUpdatedPayload, subscribeRealtime } from '../../context/realtimeClient';
import categories from "../../constants/categories";
import { ExploreTheme } from "../../constants/explore-theme";

export default function HomeScreen() {

    const router = useRouter();
    const tabBarHeight = useBottomTabBarHeight();
    const { userData, fetchUserData, setBalanceFromSnapshot } = useUserStore();

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

    const getMarketData = useCallback(async (endpoint:string) => {
        setMarketsLoading(true);
        const {ok, data} = await api.get("/markets/"+endpoint);
        if(ok){
            const normalizedPredictions = Array.isArray(data)
                ? data.filter(i => i && i.id)
                : (Array.isArray(data.data) ? data.data.filter((i: any) => i && i.id) : []);

            setPrediction(normalizedPredictions);
            setNoMarket(normalizedPredictions.length === 0);
        } else {
            Alert.alert('Something wrong happened when fetching for predictions!');
        }
        setMarketsLoading(false);
    }, []);

    useEffect(() => {
        getMarketData(activeCategory);
    }, [activeCategory, getMarketData]);

    useEffect(() => {
        const unsubscribe = subscribeRealtime({
            channels: ['market.updated', 'portfolio.updated'],
            onEvent: (event, payload) => {
                if (event === 'market.updated') {
                    void getMarketData(activeCategory);
                    return;
                }

                const portfolioPayload = payload as PortfolioUpdatedPayload;
                if (event === 'portfolio.updated' && portfolioPayload.userId === String(userData?.id ?? '')) {
                    setBalanceFromSnapshot(portfolioPayload.balance);
                }
            },
            onReconnect: () => {
                void getMarketData(activeCategory);
                void fetchUserData();
            },
        });

        return unsubscribe;
    }, [activeCategory, fetchUserData, getMarketData, setBalanceFromSnapshot, userData?.id]);

    const goMarketDetails = useCallback((id:number) => {
        router.push({ pathname: '/marketDetails', params: {id} });
    }, [router]);


    return (
        <View className="flex-1" style={{ backgroundColor: ExploreTheme.pageBg }}>
            {/* White header zone — includes status bar */}
            <SafeAreaView edges={['top']} className="bg-white">
                <View
                    className="px-5 bg-white"
                    style={{
                        borderBottomWidth: 1,
                        borderBottomColor: ExploreTheme.headerBorder,
                        paddingVertical: 14,
                    }}
                >
                    <HomeHeader
                        balance={userData?.balance ?? 0}
                        onCreatePress={() => router.push({ pathname: '/marketDetails', params: { mode: 'create' } })}
                        onNotificationPress={() => router.push('/notifications')}
                    />
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
                    <HomeListSkeleton count={5} />
                ) : (
                    noMarket ? (
                        <NoMarkets/>
                    ) : (
                        <FlatList
                            data={predictions}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item, index }) => (
                                <PredictionCard
                                    prediction={item}
                                    onPress={() => goMarketDetails(item.id)}
                                    index={index}
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

