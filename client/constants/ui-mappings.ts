import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export type CategoryIconMapping = {
    name: keyof typeof MaterialIcons.glyphMap;
    color: string;
    bg: string;
};

export const categoryIconMap: Record<string, CategoryIconMapping> = {
    SPORTS: { name: 'sports-basketball', color: '#10B981', bg: '#ECFDF5' },
    POLITICS: { name: 'gavel', color: '#6366F1', bg: '#EEF2FF' },
    CRYPTO: { name: 'attach-money', color: '#F59E0B', bg: '#FFF7ED' },
    CULTURE: { name: 'movie', color: '#EC4899', bg: '#FDF2F8' },
    TECHNOLOGY: { name: 'computer', color: '#3B82F6', bg: '#EFF6FF' },
    SCHOOL: { name: 'school', color: '#8B5CF6', bg: '#F5F3FF' },
};

export const OPTION_COLORS = ['#10B981', '#EF4444', '#3B82F6', '#F59E0B', '#EC4899', '#6366F1'];
