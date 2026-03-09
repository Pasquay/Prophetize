import {Text, View} from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';

export default function NoMarketsAvailable(){
    return (
        <View className="h-full justify-center">
            <View className="flew-col items-center h-auto  bg-white p-6 rounded-xl border-[1px] border-[#E2E8F0] ">
                <Text className="font-jetbrain-bold text-4xl text-center mb-4 text-[#94A3B8]">NO MARKETS FOR THIS CATEGORY AVAILABLE</Text>
                <Entypo name="emoji-sad" size={48} color="#94A3B8" />
            </View>
        </View>
    )
}