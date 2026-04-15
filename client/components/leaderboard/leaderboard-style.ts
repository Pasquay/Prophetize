export const getTopRankStyle = (rank: number) => {
    if (rank === 1) {
        return {
            borderColor: '#E7CB62',
            badgeBg: '#FFF4C9',
            badgeColor: '#A56E00',
            rankColor: '#A56E00',
            cardBg: '#FFFDF2',
            stripeBg: '#F9EDB5',
            shadowColor: '#D4A11D',
        };
    }
    if (rank === 2) {
        return {
            borderColor: '#CAD5E4',
            badgeBg: '#EEF3FA',
            badgeColor: '#4C617C',
            rankColor: '#4C617C',
            cardBg: '#F7FAFF',
            stripeBg: '#E5EDF8',
            shadowColor: '#9BB3CC',
        };
    }
    return {
        borderColor: '#E7C6AA',
        badgeBg: '#FFF0E4',
        badgeColor: '#99540F',
        rankColor: '#99540F',
        cardBg: '#FFF9F4',
        stripeBg: '#FCE3D0',
        shadowColor: '#D49B6C',
    };
};
