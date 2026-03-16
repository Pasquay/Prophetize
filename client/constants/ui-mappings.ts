import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { UI_COLORS } from './ui-tokens';

export type CategoryIconMapping = {
    name: keyof typeof MaterialIcons.glyphMap;
    color: string;
    bg: string;
};

export const categoryIconMap: Record<string, CategoryIconMapping> = {
    SPORTS: { name: 'sports-basketball', color: '#10B981', bg: '#ECFDF5' },
    POLITICS: { name: 'gavel', color: UI_COLORS.accent, bg: UI_COLORS.accentSoft },
    CRYPTO: { name: 'attach-money', color: '#F59E0B', bg: '#FFF7ED' },
    CULTURE: { name: 'movie', color: '#EC4899', bg: '#FDF2F8' },
    TECHNOLOGY: { name: 'computer', color: UI_COLORS.accent, bg: UI_COLORS.accentSoft },
    SCHOOL: { name: 'school', color: '#8B5CF6', bg: '#F5F3FF' },
};

export const OPTION_COLORS = ['#10B981', '#EF4444', UI_COLORS.accent, '#F59E0B', '#EC4899', UI_COLORS.info];
