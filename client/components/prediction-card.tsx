import {Prediction} from "../.expo/types/model";
import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { categoryIconMap, OPTION_COLORS } from '@/constants/ui-mappings';

type Props = {
    prediction: Prediction;
    onPress: () => void;
}

const normalizeProbability = (value: number) => {
  const normalized = value > 1 ? value / 100 : value;
  return Math.max(0, Math.min(1, normalized));
};

export default function PredictionCard({prediction, onPress}:Props) {
  const mediumDate = prediction.endDate
    ? new Date(prediction.endDate).toLocaleDateString('en-US', { dateStyle: 'medium' })
    : 'TBD';

  const categoryIcon = categoryIconMap[prediction.category] ?? { name: "help-outline", color: "#94A3B8" };

    return (
    <Pressable onPress={onPress} className="w-full h-auto rounded-[12px] border-[#E2E8F0] border-[1px]">
      <View className="bg-white rounded-2xl overflow-hidden shadow-sm">

        {/* Image with diagonal gradient fade: top-right visible → bottom-left hidden */}
        {prediction.image ? (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: prediction.image }}
              style={styles.image}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'white']}
              start={{ x: 1, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
          </View>
        ) : null}

        {/* Content Section */}
        <View className="p-5">
          {/* Category and Read Time */}
          <View className="flex-row items-center gap-3 mb-2">
            <MaterialIcons name={categoryIcon.name} size={18} color={categoryIcon.color} />
            <Text className="text-[#94A3B8] text-[12px] font-medium font-jetbrain">
              {prediction.category}
            </Text>
            <View className="flex-1" />
            <View className="bg-[#F8FAFC] rounded-xl px-4 py-2 ">
              <Text className="text-[#94A3B8] text-[12px] font-jetbrain-bold">
                Ends {mediumDate}
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text className="text-gray-900 text-[18px] font-semibold mb-2 leading-7 font-grotesk-bold w-3/5">
            {prediction?.title}
          </Text>


           {/* Option Labels */}
          {prediction?.options?.length === 2 ? (
            <View className="flex-row justify-between mt-2">
              <Text style={{ color: OPTION_COLORS[0] }} className="font-jetbrain-bold text-[14px]">
                {prediction.options[0].name} {(normalizeProbability(prediction.options[0].probability) * 100).toFixed(0)}%
              </Text>
              <Text style={{ color: OPTION_COLORS[1] }} className="font-jetbrain-bold text-[14px]">
                {prediction.options[1].name} {(normalizeProbability(prediction.options[1].probability) * 100).toFixed(0)}%
              </Text>
            </View>
          ) : (
            <View className="flex-row w-full mt-2">
              {(prediction?.options || []).map((option, index) => {
                const percent = normalizeProbability(option.probability) * 100;
                const color = OPTION_COLORS[index % OPTION_COLORS.length];
                return (
                  <View
                    key={option.id ?? index}
                    style={{ width: `${percent}%` }}
                    className="overflow-hidden"
                  >
                    <Text style={{ color }} className="font-jetbrain-bold text-[11px]" numberOfLines={1}>
                      {option.name}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* Dynamic Progress Bar */}
          <View className="flex-row w-full h-2.5 rounded-xl overflow-hidden mt-1">
            {(prediction?.options || []).map((option, index) => {
              const percent = normalizeProbability(option.probability) * 100;
              const color = OPTION_COLORS[index % OPTION_COLORS.length];
              return (
                <View
                  key={option.id ?? index}
                  style={{ width: `${percent}%`, backgroundColor: color }}
                />
              );
            })}
          </View>

          {/* Line Break */}
          <View className="w-full h-[1px] bg-stone-200 mt-4 overflow-hidden"/>

          {/* Brief Summary and Volume*/}
          <View className="flex-row mt-4">
            <Text className="font-jetbrain text-[14px]">Sample</Text>
            <View className="flex-1"/>
            <Text className="font-jetbrain text-[12px]">Vol: <Text className="font-jetbrain-bold">{((prediction.total_volume ?? ((prediction as Prediction & { volume?: number }).volume ?? 0))).toLocaleString()}</Text></Text>
          </View>

        </View>
      </View>
    </Pressable>
    );
}

const styles = StyleSheet.create({
  imageContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '50%',
    height: '100%',
    zIndex: 0,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

