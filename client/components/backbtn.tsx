import AntDesign from '@expo/vector-icons/AntDesign';
import { View } from 'react-native';

interface BackBtnProps {
    size?: number;
    color?: string;
}

export const BackBtn = ({ size, color  }: BackBtnProps) => {
    return (
        <View
            style={{
                width: 50,
                height: 50,
                borderRadius: 100,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderWidth: 1.5,
                borderColor: 'rgba(0, 0, 0, 0.1)',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <AntDesign name="arrow-left" size={size} color={color} />
        </View>
    );
};

export default BackBtn;