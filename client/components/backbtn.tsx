import { Ionicons } from '@expo/vector-icons';

interface BackBtnProps {
    size?: number;
    color?: string;
}

export const BackBtn = ({ size = 24, color = '#0F172A' }: BackBtnProps) => {
    return <Ionicons name="chevron-back" size={size} color={color} />;
};

export default BackBtn;