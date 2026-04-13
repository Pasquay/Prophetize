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
import { useUserStore } from '@/context/useUserStore';

const CREATE_MARKET_CATEGORIES = ['SPORTS', 'CRYPTO', 'POLITICS', 'CULTURE', 'TECHNOLOGY'];


export default function DetailsScreen() {
  const { id, mode } = useLocalSearchParams<{ id?: string; mode?: string }>();
  const marketID = id ? Number(id) : null;
  const isCreateMode = mode === 'create' || !id;

  const [marketLoading, setMarketLoading] = useState(true);
  const [prediction, setPrediction] = useState<Prediction>();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [tradeLoading, setTradeLoading] = useState(false);
  const [tradeMessage, setTradeMessage] = useState<string | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [shareInput, setShareInput] = useState('1');
  const [userPosition, setUserPosition] = useState<number | null>(null);
  const [comments, setComments] = useState<api.CommentItem[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  const { fetchUserData, setBalanceFromSnapshot } = useUserStore();

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

  useEffect(() => {
    if (!isCreateMode) {
      fetchUserData();
    }
  }, [fetchUserData, isCreateMode]);

  useEffect(() => {
    if (!prediction?.options?.length) {
      setSelectedOptionId(null);
      return;
    }

    setSelectedOptionId(prediction.options[0].id);
  }, [prediction]);

  const loadComments = useCallback(async () => {
    if (!marketID || Number.isNaN(marketID)) {
      setComments([]);
      return;
    }

    setCommentsLoading(true);
    const { ok, data } = await api.getComments(marketID);
    if (ok) {
      setComments(Array.isArray(data?.data) ? data.data : []);
    }
    setCommentsLoading(false);
  }, [marketID]);

  useEffect(() => {
    if (!isCreateMode) {
      void loadComments();
    }
  }, [isCreateMode, loadComments]);

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

  const handleTrade = useCallback(async (side: 'buy' | 'sell') => {
    if (!prediction) {
      return;
    }

    if (tradeLoading) {
      return;
    }

    if (!selectedOptionId) {
      Alert.alert('Missing option', 'Please select an option before placing a trade.');
      return;
    }

    const shares = Number(shareInput);
    if (!Number.isFinite(shares) || shares <= 0) {
      Alert.alert('Invalid shares', 'Enter a shares value greater than 0.');
      return;
    }

    setTradeLoading(true);
    setTradeMessage(null);

    const tradeFn = side === 'buy' ? api.buyShares : api.sellShares;
    const { ok, data } = await tradeFn({
      optionId: selectedOptionId,
      shares,
    });

    setTradeLoading(false);

    if (!ok) {
      Alert.alert('Trade failed', data?.error ?? 'Unable to execute trade right now.');
      return;
    }

    if (typeof data?.snapshot?.balance === 'number') {
      setBalanceFromSnapshot(data.snapshot.balance);
    }

    const sharesOwned = Number(data?.snapshot?.position?.sharesOwned);
    if (Number.isFinite(sharesOwned)) {
      setUserPosition(sharesOwned);
    }

    setTradeMessage(data?.message ?? 'Trade submitted successfully.');
    await fetchUserData();
  }, [prediction, tradeLoading, selectedOptionId, shareInput, setBalanceFromSnapshot, fetchUserData]);

  const handlePostComment = useCallback(async () => {
    if (!marketID || Number.isNaN(marketID)) {
      return;
    }

    if (!commentInput.trim()) {
      Alert.alert('Comment required', 'Write a short comment before posting.');
      return;
    }

    setCommentSubmitting(true);
    const { ok, data } = await api.createComment(marketID, commentInput.trim());
    setCommentSubmitting(false);

    if (!ok) {
      Alert.alert('Comment failed', data?.error ?? 'Unable to post your comment right now.');
      return;
    }

    setCommentInput('');
    await loadComments();
  }, [commentInput, loadComments, marketID]);

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
        <MarketDetailSummary prediction={prediction} userPosition={userPosition} />
        <View
          className="mx-4 mt-3 rounded-2xl p-4"
          style={{
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: ExploreTheme.headerBorder,
          }}
        >
          <Text className="font-grotesk-bold text-[16px] mb-2" style={{ color: ExploreTheme.titleText }}>
            Trade
          </Text>
          <Text className="font-jetbrain text-[12px] mb-3" style={{ color: ExploreTheme.secondaryText }}>
            Select an option, enter shares, then buy or sell.
          </Text>

          <View className="flex-row flex-wrap gap-2 mb-3">
            {prediction.options.map((option) => {
              const isSelected = option.id === selectedOptionId;
              return (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => setSelectedOptionId(option.id)}
                  className="rounded-full px-3 py-2"
                  style={{
                    borderWidth: 1,
                    borderColor: ExploreTheme.headerBorder,
                    backgroundColor: isSelected ? ExploreTheme.titleText : '#FFFFFF',
                  }}
                >
                  <Text
                    className="font-jetbrain text-[12px]"
                    style={{ color: isSelected ? '#FFFFFF' : ExploreTheme.titleText }}
                  >
                    {option.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TextInput
            value={shareInput}
            onChangeText={setShareInput}
            keyboardType="decimal-pad"
            placeholder="Shares"
            className="bg-white rounded-xl px-4 py-3 mb-3 font-jetbrain"
            style={{ borderWidth: 1, borderColor: ExploreTheme.headerBorder, color: ExploreTheme.titleText }}
          />

          <View className="flex-row gap-2">
            <TouchableOpacity
              disabled={tradeLoading}
              onPress={() => handleTrade('buy')}
              className="flex-1 rounded-xl py-3 items-center"
              style={{ backgroundColor: tradeLoading ? ExploreTheme.headerBorder : '#0F8A5F' }}
            >
              <Text className="font-grotesk-bold text-[14px]" style={{ color: '#FFFFFF' }}>
                {tradeLoading ? 'Processing...' : 'Buy'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={tradeLoading}
              onPress={() => handleTrade('sell')}
              className="flex-1 rounded-xl py-3 items-center"
              style={{ backgroundColor: tradeLoading ? ExploreTheme.headerBorder : '#CC3A3A' }}
            >
              <Text className="font-grotesk-bold text-[14px]" style={{ color: '#FFFFFF' }}>
                {tradeLoading ? 'Processing...' : 'Sell'}
              </Text>
            </TouchableOpacity>
          </View>

          {tradeMessage ? (
            <Text className="font-jetbrain text-[12px] mt-3" style={{ color: ExploreTheme.secondaryText }}>
              {tradeMessage}
            </Text>
          ) : null}
        </View>

        <View
          className="mx-4 mt-3 rounded-2xl p-4"
          style={{
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: ExploreTheme.headerBorder,
          }}
        >
          <Text className="font-grotesk-bold text-[16px] mb-2" style={{ color: ExploreTheme.titleText }}>
            Comments
          </Text>
          <TextInput
            value={commentInput}
            onChangeText={setCommentInput}
            placeholder="Share your take..."
            multiline
            maxLength={280}
            className="bg-white rounded-xl px-4 py-3 mb-3 font-jetbrain"
            style={{ borderWidth: 1, borderColor: ExploreTheme.headerBorder, color: ExploreTheme.titleText, minHeight: 84 }}
          />
          <TouchableOpacity
            disabled={commentSubmitting}
            onPress={handlePostComment}
            className="rounded-xl py-3 items-center mb-3"
            style={{ backgroundColor: commentSubmitting ? ExploreTheme.headerBorder : ExploreTheme.titleText }}
          >
            <Text className="font-grotesk-bold text-[14px]" style={{ color: '#FFFFFF' }}>
              {commentSubmitting ? 'Posting...' : 'Post Comment'}
            </Text>
          </TouchableOpacity>

          {commentsLoading ? (
            <Text className="font-jetbrain text-[12px]" style={{ color: ExploreTheme.secondaryText }}>
              Loading comments...
            </Text>
          ) : comments.length === 0 ? (
            <Text className="font-jetbrain text-[12px]" style={{ color: ExploreTheme.secondaryText }}>
              No comments yet.
            </Text>
          ) : (
            comments.map((item) => (
              <View key={item.id} className="mb-3 pb-3" style={{ borderBottomWidth: 1, borderBottomColor: ExploreTheme.headerBorder }}>
                <Text className="font-jetbrain text-[11px] mb-1" style={{ color: ExploreTheme.secondaryText }}>
                  {item.user_id}
                </Text>
                <Text className="font-jetbrain text-[13px]" style={{ color: ExploreTheme.titleText }}>
                  {item.content}
                </Text>
              </View>
            ))
          )}
        </View>
      </View>
      ) : null}
    </View>
  )
}
