import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState, useCallback } from 'react';
import { Text, View, Alert, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as api from '../utils/api';
import {Prediction} from "../.expo/types/model";
import LoadingScreen from '../components/loading-screen';
import MarketDetailsHeader from "../components/market-detail-header";
import MarketDetailBalance from "../components/market-detail-balance";
import MarketDetailSummary from "../components/market-detail-summary";


export default function DetailsScreen() {
  const { id } = useLocalSearchParams();

  const marketID = Number(id);

  const [marketLoading, setMarketLoading] = useState(true);
  const [prediction, setPrediction] = useState<Prediction>();

  useEffect(() => {
    const getMarketData = async (marketID:number) => {
        setMarketLoading(true);
        const {ok, data} = await api.get("/markets/"+marketID);
        if(ok){
            setPrediction(data?.data ?? null);
            console.log(data.data.title);
        } else {
            Alert.alert('Something wrong happened when fetching for predictions!');
        }
        setMarketLoading(false);
      };
      getMarketData(marketID); 
    }, [marketID]);


  return (
    <View className="flex-1 bg-[#F7F9FC] gap-2">
      <SafeAreaView edges={['top']} className="bg-white">
          <View className="p-5 bg-white " style={{ borderBottomWidth: 1, borderBottomColor: '#E8EDF5' }}>
            <MarketDetailsHeader
              title={prediction ? prediction.title : "undefined"}
            />
          </View>   
      </SafeAreaView>
      {marketLoading ? (
        <LoadingScreen />
      ) : prediction ? (
      <View>
        <MarketDetailBalance />
        <MarketDetailSummary prediction={prediction} />
      </View>
      ) : null};

      {/* {marketLoading ? <LoadingScreen/> : <Text></Text>} */}

      {/* <Text>Showing details for ID: {id}</Text> */}
    </View>
  )
}