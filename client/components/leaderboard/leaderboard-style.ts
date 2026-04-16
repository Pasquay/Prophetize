import { UI_COLORS } from '@/constants/ui-tokens';

export const getTopRankStyle = (rank: number) => {
    if (rank === 1) {
        const token = UI_COLORS.leaderboard.rank1;
        return {
            borderColor: token.border,
            badgeBg: token.badgeBg,
            badgeColor: token.badgeText,
            rankColor: token.rankText,
            cardBg: token.cardBg,
            stripeBg: token.stripeBg,
            shadowColor: token.shadow,
        };
    }
    if (rank === 2) {
        const token = UI_COLORS.leaderboard.rank2;
        return {
            borderColor: token.border,
            badgeBg: token.badgeBg,
            badgeColor: token.badgeText,
            rankColor: token.rankText,
            cardBg: token.cardBg,
            stripeBg: token.stripeBg,
            shadowColor: token.shadow,
        };
    }
    const token = UI_COLORS.leaderboard.rank3;
    return {
        borderColor: token.border,
        badgeBg: token.badgeBg,
        badgeColor: token.badgeText,
        rankColor: token.rankText,
        cardBg: token.cardBg,
        stripeBg: token.stripeBg,
        shadowColor: token.shadow,
    };
};
