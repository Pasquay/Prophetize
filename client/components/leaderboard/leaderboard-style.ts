export const getTopRankStyle = (rank: number) => {
    if (rank === 1) {
        return {
            borderColor: '#E8D15A',
            badgeBg: '#FFF8D8',
            badgeColor: '#A77900',
            rankColor: '#C28C00',
            cardBg: '#FFFEF6',
        };
    }
    if (rank === 2) {
        return {
            borderColor: '#D7DEE8',
            badgeBg: '#F5F8FD',
            badgeColor: '#4B5563',
            rankColor: '#677388',
            cardBg: '#F8FAFF',
        };
    }
    return {
        borderColor: '#EDC7A6',
        badgeBg: '#FFF3E8',
        badgeColor: '#9A4F00',
        rankColor: '#AF5500',
        cardBg: '#FFF8F1',
    };
};
