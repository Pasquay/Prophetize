import { View, ActivityIndicator } from 'react-native';

export default function LoadingScreen() {
    return (
        <View className="flex-1 items-center justify-center z-100">
            <ActivityIndicator size="large" color="#000000" />
        </View>
    );
}