import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Prediction } from '../.expo/types/model';
import CardSkeleton from '@/components/explore/card-skeleton';
import PredictionCard from '@/components/explore/prediction-card';
import { ExploreTheme } from '../constants/explore-theme';
import * as api from '../utils/api';
import { normalizePrediction } from '../utils/prediction-helpers';

const PAGE_SIZE = 10;

export default function ExploreDetails() {
    const router = useRouter();
    const { sort, category, search } = useLocalSearchParams<{
        sort?: string;
        category?: string;
        search?: string;
    }>();

    const [markets, setMarkets] = useState<Prediction[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const offsetRef = useRef(0);

    /** Build the title based on the params */
    const pageTitle = search
        ? `"${search}"`
        : category
        ? category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()
        : sort === 'trending'
        ? 'Trending'
        : sort === 'newest'
        ? 'New Markets'
        : 'Explore';

    const fetchPage = useCallback(async (offset: number, append: boolean) => {
        if (offset === 0) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const params = new URLSearchParams();
            params.set('limit', String(PAGE_SIZE));
            params.set('offset', String(offset));

            if (sort) params.set('sort', String(sort));
            if (category) params.set('category', String(category).toUpperCase());
            if (search) params.set('search', String(search));

            const { ok, data } = await api.get(`/markets/explore?${params.toString()}`);
            const rawItems = ok && Array.isArray(data) ? data : [];

            const items = rawItems.map((item: any) => normalizePrediction(item));

            setMarkets((prev) => (append ? [...prev, ...items] : items));
            offsetRef.current = offset + items.length;
            setHasMore(items.length === PAGE_SIZE);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [category, search, sort]);

    useEffect(() => {
        offsetRef.current = 0;
        setMarkets([]);
        setHasMore(true);
        fetchPage(0, false);
    }, [fetchPage]);

    const goMarketDetails = useCallback(
        (id: number) => router.push({ pathname: '/marketDetails', params: { id } }),
        [router],
    );

    return (
        <View style={{ flex: 1, backgroundColor: ExploreTheme.pageBg }}>
            {/* Header */}
            <SafeAreaView style={{ backgroundColor: ExploreTheme.pageBg }}>
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: 20,
                        paddingVertical: 14,
                        borderBottomWidth: 1,
                        borderBottomColor: ExploreTheme.headerBorder,
                        backgroundColor: ExploreTheme.pageBg,
                        gap: 12,
                    }}
                >
                    <Pressable onPress={() => router.back()} hitSlop={8}>
                        <MaterialIcons name="arrow-back" size={24} color={ExploreTheme.titleText} />
                    </Pressable>
                    <Text
                        style={{ flex: 1, fontSize: 18, color: ExploreTheme.titleText }}
                        className="font-grotesk-bold"
                        numberOfLines={1}
                    >
                        {pageTitle}
                    </Text>
                </View>
            </SafeAreaView>

            {/* List */}
            {loading ? (
                <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 16, gap: 14 }}>
                    {Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)}
                </View>
            ) : (
                <FlatList
                    testID="explore-details-list"
                    data={markets}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={({ item }) => (
                        <PredictionCard
                            prediction={item}
                            onPress={() => goMarketDetails(item.id)}
                        />
                    )}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 16, gap: 14 }}
                    showsVerticalScrollIndicator={false}
                    onEndReached={() => {
                        if (!loadingMore && hasMore) fetchPage(offsetRef.current, true);
                    }}
                    onEndReachedThreshold={0.4}
                    ListFooterComponent={
                        loadingMore ? (
                            <ActivityIndicator
                                testID="explore-details-loading-more"
                                size="small"
                                color={ExploreTheme.linkText}
                                style={{ marginTop: 16 }}
                            />
                        ) : !hasMore ? (
                            <Text
                                testID="explore-details-end"
                                style={{ marginTop: 16, textAlign: 'center', color: ExploreTheme.secondaryText }}
                                className="font-jetbrain"
                            >
                                You reached the end
                            </Text>
                        ) : null
                    }
                    ListEmptyComponent={
                        <View style={{ alignItems: 'center', paddingTop: 60 }}>
                            <MaterialIcons name="inbox" size={48} color={ExploreTheme.emptyIcon} />
                            <Text
                                style={{ color: ExploreTheme.secondaryText, marginTop: 8, fontSize: 14 }}
                                className="font-jetbrain"
                            >
                                No markets found
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}
