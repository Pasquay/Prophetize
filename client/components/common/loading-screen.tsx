import { View, ActivityIndicator, Modal } from 'react-native';
import { UI_COLORS } from '@/constants/ui-tokens';

export default function LoadingScreen() {
    return (
        <Modal transparent animationType="none">
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color={UI_COLORS.accent} />
            </View>
        </Modal>
    );
}