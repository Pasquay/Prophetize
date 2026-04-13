import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState, useCallback } from 'react';
import { Text, View, Alert, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as api from '../utils/api';
import {Prediction} from "../.expo/types/model";
import LoadingScreen from '@/components/common/loading-screen';
import MarketDetailsHeader from "@/components/market/market-detail-header";
import MarketDetailBalance from "@/components/market/market-detail-balance";
import MarketDetailSummary from "@/components/market/market-detail-summary";
import { ExploreTheme } from "../constants/explore-theme";

const CREATE_MARKET_CATEGORIES = ['SPORTS', 'CRYPTO', 'POLITICS', 'CULTURE', 'TECHNOLOGY'];


export default function DetailsScreen() {
  const { id, mode } = useLocalSearchParams<{ id?: string; mode?: string }>();
  const marketID = id ? Number(id) : null;
  const isCreateMode = mode === 'create' || !id;

  const [marketLoading, setMarketLoading] = useState(true);
  const [prediction, setPrediction] = useState<Prediction>();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('SPORTS');
  const [resolutionDate, setResolutionDate] = useState('');
  const [optionOne, setOptionOne] = useState('Yes');
  const [optionTwo, setOptionTwo] = useState('No');

  useEffect(() => {
    if (isCreateMode || marketID === null || Number.isNaN(marketID)) {
      setMarketLoading(false);
      return;
    }

    const getMarketData = async (marketID:number) => {
        setMarketLoading(true);
        const {ok, data} = await api.get("/markets/"+marketID);
        if(ok){
            setPrediction(data?.data ?? null);
        } else {
            Alert.alert('Something wrong happened when fetching for predictions!');
        }
        setMarketLoading(false);
      };
      getMarketData(marketID); 
    }, [isCreateMode, marketID]);

  const handleCreateMarket = useCallback(async () => {
    const normalizedCategory = category.trim().toUpperCase();
    const optionValues = [optionOne.trim(), optionTwo.trim()].filter(Boolean);

    if (!title.trim() || !description.trim() || !normalizedCategory || !resolutionDate.trim()) {
      Alert.alert('Missing fields', 'Please complete title, description, category, and resolution date.');
      return;
    }

    if (!CREATE_MARKET_CATEGORIES.includes(normalizedCategory)) {
      Alert.alert('Invalid category', `Use one of: ${CREATE_MARKET_CATEGORIES.join(', ')}`);
      return;
    }

    const parsedDate = new Date(resolutionDate);
    if (Number.isNaN(parsedDate.getTime())) {
      Alert.alert('Invalid date', 'Use ISO date format, for example 2026-12-31T00:00:00.000Z');
      return;
    }

    if (optionValues.length < 2) {
      Alert.alert('Invalid options', 'Please provide at least two options.');
      return;
    }

    setSubmitLoading(true);
    setSubmitMessage(null);

    const { ok, data } = await api.createMarket({
      title: title.trim(),
      description: description.trim(),
      category: normalizedCategory,
      endDate: parsedDate.toISOString(),
      options: optionValues,
    });

    setSubmitLoading(false);

    if (!ok) {
      Alert.alert('Create market failed', data?.error ?? 'Unable to submit market right now.');
      return;
    }

    setSubmitMessage(data?.message ?? 'Market submitted and pending admin approval.');
    setTitle('');
    setDescription('');
    setCategory('SPORTS');
    setResolutionDate('');
    setOptionOne('Yes');
    setOptionTwo('No');
  }, [title, description, category, resolutionDate, optionOne, optionTwo]);

  if (isCreateMode) {
    return (
      <View className="flex-1" style={{ backgroundColor: ExploreTheme.pageBg }}>
        <SafeAreaView edges={['top']} className="bg-white">
          <View
            className="bg-white"
            style={{
              borderBottomWidth: 1,
              borderBottomColor: ExploreTheme.headerBorder,
              paddingHorizontal: 20,
              paddingVertical: 14,
            }}
          >
            <MarketDetailsHeader title="Create Market" />
          </View>
        </SafeAreaView>

        <ScrollView className="px-5 py-4">
          <Text className="font-grotesk-bold text-[22px] mb-2" style={{ color: ExploreTheme.titleText }}>
            Submit New Market
          </Text>
          <Text className="font-jetbrain text-[13px] mb-4" style={{ color: ExploreTheme.secondaryText }}>
            New markets are pending until admin approval and will not appear publicly until approved.
          </Text>

          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Title"
            className="bg-white rounded-xl px-4 py-3 mb-3 font-jetbrain"
            style={{ borderWidth: 1, borderColor: ExploreTheme.headerBorder, color: ExploreTheme.titleText }}
          />
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Description"
            multiline
            className="bg-white rounded-xl px-4 py-3 mb-3 font-jetbrain"
            style={{ borderWidth: 1, borderColor: ExploreTheme.headerBorder, color: ExploreTheme.titleText, minHeight: 92 }}
          />
          <TextInput
            value={category}
            onChangeText={setCategory}
            placeholder={`Category (${CREATE_MARKET_CATEGORIES.join(', ')})`}
            autoCapitalize="characters"
            className="bg-white rounded-xl px-4 py-3 mb-3 font-jetbrain"
            style={{ borderWidth: 1, borderColor: ExploreTheme.headerBorder, color: ExploreTheme.titleText }}
          />
          <TextInput
            value={resolutionDate}
            onChangeText={setResolutionDate}
            placeholder="Resolution date (ISO)"
            className="bg-white rounded-xl px-4 py-3 mb-3 font-jetbrain"
            style={{ borderWidth: 1, borderColor: ExploreTheme.headerBorder, color: ExploreTheme.titleText }}
          />
          <TextInput
            value={optionOne}
            onChangeText={setOptionOne}
            placeholder="Option 1"
            className="bg-white rounded-xl px-4 py-3 mb-3 font-jetbrain"
            style={{ borderWidth: 1, borderColor: ExploreTheme.headerBorder, color: ExploreTheme.titleText }}
          />
          <TextInput
            value={optionTwo}
            onChangeText={setOptionTwo}
            placeholder="Option 2"
            className="bg-white rounded-xl px-4 py-3 mb-4 font-jetbrain"
            style={{ borderWidth: 1, borderColor: ExploreTheme.headerBorder, color: ExploreTheme.titleText }}
          />

          <TouchableOpacity
            disabled={submitLoading}
            onPress={handleCreateMarket}
            className="rounded-xl py-3 items-center"
            style={{ backgroundColor: submitLoading ? ExploreTheme.headerBorder : ExploreTheme.titleText }}
          >
            <Text className="font-grotesk-bold text-[14px]" style={{ color: '#FFFFFF' }}>
              {submitLoading ? 'Submitting...' : 'Submit For Review'}
            </Text>
          </TouchableOpacity>

          {submitMessage ? (
            <Text className="font-jetbrain text-[13px] mt-3" style={{ color: ExploreTheme.secondaryText }}>
              {submitMessage}
            </Text>
          ) : null}
        </ScrollView>
      </View>
    );
  }


  return (
    <View className="flex-1 gap-2" style={{ backgroundColor: ExploreTheme.pageBg }}>
      <SafeAreaView edges={['top']} className="bg-white">
          <View
            className="bg-white"
            style={{
              borderBottomWidth: 1,
              borderBottomColor: ExploreTheme.headerBorder,
              paddingHorizontal: 20,
              paddingVertical: 14,
            }}
          >
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
      ) : null}
    </View>
  )
}
