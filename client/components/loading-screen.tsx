import { View, ActivityIndicator, Modal } from 'react-native';

export default function LoadingScreen() {
    return (
        <Modal transparent animationType="none">
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#000000" />
            </View>
        </Modal>
    );
}