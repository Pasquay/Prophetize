import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import LeaderboardMyPositionCard from '@/components/leaderboard/my-position-card';
import LeaderboardPodium from '@/components/leaderboard/leaderboard-podium';
import LeaderboardRow, { LeaderboardEntry } from '@/components/leaderboard/leaderboard-row';
import LeaderboardSegment, { LeaderboardPeriod } from '@/components/leaderboard/leaderboard-segment';
import LeaderboardSkeletonList from '@/components/leaderboard/leaderboard-skeleton-list';
import { ExploreTheme } from '@/constants/explore-theme';
import { useAuth } from '@/context/AuthContext';
import {
    LeaderboardApiEntry,
    MyLeaderboardPositionResponse,
    getLeaderboard,
    getMyLeaderboardPosition,
} from '@/utils/api';

const PAGE_SIZE = 10;

const getInitials = (username: string) => {
    const trimmed = username.trim();
    if (!trimmed) return 'NA';

    const words = trimmed.split(/\s+/).filter(Boolean);
    if (words.length > 1) {
        return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }

    return trimmed.slice(0, 2).toUpperCase();
};

const mapApiEntryToRow = (entry: LeaderboardApiEntry): LeaderboardEntry => ({
    rank: entry.rank,
    username: entry.username,
    initials: getInitials(entry.username),
    wins: entry.wins,
    profitPct: entry.profit_pct,
    isCurrentUser: Boolean(entry.is_current_user),
});

const mapMyPositionToRow = (position: MyLeaderboardPositionResponse): LeaderboardEntry => ({
    rank: position.position,
    username: position.username,
    initials: getInitials(position.username),
    wins: position.wins,
    profitPct: position.profit_pct,
    isCurrentUser: true,
});

export default function LeaderboardScreen() {
    const { token } = useAuth();

    const [period, setPeriod] = useState<LeaderboardPeriod>('weekly');
    const [allEntries, setAllEntries] = useState<LeaderboardEntry[]>([]);
    const [myPosition, setMyPosition] = useState<LeaderboardEntry | null>(null);
    const [page, setPage] = useState(0);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const requestIdRef = useRef(0);

    const subtitle = useMemo(
        () => (period === 'weekly' ? 'Weekly profit leaderboard' : 'All-time profit leaderboard'),
        [period]
    );
    const topThree = useMemo(() => allEntries.slice(0, 3), [allEntries]);
    const listEntries = useMemo(() => allEntries.slice(3), [allEntries]);

    const loadInitialPage = useCallback(async (selectedPeriod: LeaderboardPeriod) => {
        const requestId = requestIdRef.current + 1;
        requestIdRef.current = requestId;

        setIsInitialLoading(true);
        setIsFetchingMore(false);
        setErrorMessage(null);
        setAllEntries([]);
        setMyPosition(null);
        setPage(0);
        setHasNextPage(false);

        const [leaderboardRes, myPositionRes] = await Promise.all([
            getLeaderboard(selectedPeriod, 0, PAGE_SIZE),
            token ? getMyLeaderboardPosition(selectedPeriod) : Promise.resolve({ ok: false, data: null }),
        ]);

        if (requestId !== requestIdRef.current) {
            return;
        }

        if (!leaderboardRes.ok || !leaderboardRes.data) {
            setErrorMessage(leaderboardRes.data?.error ?? 'Unable to load leaderboard right now.');
            setIsInitialLoading(false);
            return;
        }

        const fetchedEntries = ((leaderboardRes.data.data as LeaderboardApiEntry[]) ?? []).map(mapApiEntryToRow);
        const meta = leaderboardRes.data.meta;

        setAllEntries(fetchedEntries);
        setPage(meta?.page ?? 0);
        setHasNextPage(Boolean(meta?.has_next_page));

        if (token && myPositionRes.ok && myPositionRes.data) {
            setMyPosition(mapMyPositionToRow(myPositionRes.data as MyLeaderboardPositionResponse));
        } else {
            setMyPosition(null);
        }

        setIsInitialLoading(false);
    }, [token]);

    const handleLoadMore = useCallback(async () => {
        if (isInitialLoading || isFetchingMore || !hasNextPage) {
            return;
        }

        setIsFetchingMore(true);
        const nextPage = page + 1;
        const result = await getLeaderboard(period, nextPage, PAGE_SIZE);

        if (!result.ok || !result.data) {
            setIsFetchingMore(false);
            return;
        }

        const nextRows = ((result.data.data as LeaderboardApiEntry[]) ?? []).map(mapApiEntryToRow);
        setAllEntries((prev) => [...prev, ...nextRows]);
        setPage(result.data.meta?.page ?? nextPage);
        setHasNextPage(Boolean(result.data.meta?.has_next_page));
        setIsFetchingMore(false);
    }, [hasNextPage, isFetchingMore, isInitialLoading, page, period]);

    useEffect(() => {
        loadInitialPage(period);
    }, [period, loadInitialPage]);

    return (
        <View className="flex-1" style={{ backgroundColor: ExploreTheme.pageBg }}>
            <SafeAreaView edges={['top']} className="bg-white">
                <View
                    className="px-5 bg-white"
                    style={{
                        borderBottomWidth: 1,
                        borderBottomColor: ExploreTheme.headerBorder,
                        paddingVertical: 14,
                    }}
                >
                    <View className="mb-2">
                        <Text className="font-grotesk-bold text-[22px]" style={{ color: ExploreTheme.titleText }}>
                            Top Prophets
                        </Text>
                        <Text className="font-jetbrain text-[12px]" style={{ color: ExploreTheme.secondaryText }}>
                            {subtitle}
                        </Text>
                    </View>

                    <LeaderboardSegment selected={period} onChange={setPeriod} />

                    <View className="flex-row items-center px-2 pt-4">
                        <Text className="font-jetbrain-bold text-[10px] w-5 tracking-[1px]" style={{ color: ExploreTheme.secondaryText }}>
                            #
                        </Text>
                        <Text className="font-jetbrain-bold text-[10px] flex-1 ml-3 tracking-[1px]" style={{ color: ExploreTheme.secondaryText }}>
                            PREDICTOR
                        </Text>
                        <Text className="font-jetbrain-bold text-[10px] tracking-[1px]" style={{ color: ExploreTheme.secondaryText }}>
                            PROFIT
                        </Text>
                    </View>
                </View>
            </SafeAreaView>

            <View className="flex-1 px-5 pt-2">
                <View className="mb-3">
                    {isInitialLoading || topThree.length === 0 ? null : <LeaderboardPodium entries={topThree} />}
                </View>

                <View className="flex-1">
                    {isInitialLoading ? (
                        <LeaderboardSkeletonList count={6} />
                    ) : errorMessage ? (
                        <View className="flex-1 items-center justify-center px-6">
                            <Text className="font-grotesk-bold text-[16px] text-center" style={{ color: ExploreTheme.titleText }}>
                                Could not load leaderboard
                            </Text>
                            <Text className="font-jetbrain text-[12px] text-center mt-2" style={{ color: ExploreTheme.secondaryText }}>
                                {errorMessage}
                            </Text>
                        </View>
                    ) : allEntries.length === 0 ? (
                        <View className="flex-1 items-center justify-center px-6">
                            <Text className="font-grotesk-bold text-[16px] text-center" style={{ color: ExploreTheme.titleText }}>
                                No rankings available yet
                            </Text>
                            <Text className="font-jetbrain text-[12px] text-center mt-2" style={{ color: ExploreTheme.secondaryText }}>
                                Check back later for updated standings.
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={listEntries}
                            keyExtractor={(item) => `${period}-${item.rank}-${item.username}`}
                            renderItem={({ item }) => <LeaderboardRow item={item} />}
                            onEndReached={handleLoadMore}
                            onEndReachedThreshold={0.4}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ gap: 8, paddingBottom: 102 }}
                            ListFooterComponent={
                                isFetchingMore ? <LeaderboardSkeletonList count={2} compact /> : null
                            }
                        />
                    )}
                </View>

                {myPosition ? (
                    <View
                        style={{
                            position: 'absolute',
                            left: 20,
                            right: 20,
                            bottom: 6,
                        }}
                    >
                        <LeaderboardMyPositionCard item={myPosition} />
                    </View>
                ) : null}
            </View>
        </View>
    );
}

