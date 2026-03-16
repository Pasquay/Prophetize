import {Prediction} from "../.expo/types/model";
import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { categoryIconMap, OPTION_COLORS } from '@/constants/ui-mappings';
import { ExploreTheme } from '../constants/explore-theme';

type Props = {
    prediction: Prediction;
    onPress: () => void;
}

const normalizeProbability = (value: number) => {
  const normalized = value > 1 ? value / 100 : value;
  return Math.max(0, Math.min(1, normalized));
};

const formatOptionLabel = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

export default function PredictionCard({prediction, onPress}:Props) {
  const mediumDate = prediction.endDate
    ? new Date(prediction.endDate).toLocaleDateString('en-US', { dateStyle: 'medium' })
    : 'TBD';

  const categoryIcon = categoryIconMap[prediction.category] ?? { name: "help-outline", color: "#94A3B8" };
  const options = prediction?.options || [];
  const rawPercents = options.map((option) => normalizeProbability(option.probability) * 100);
  const totalPercent = rawPercents.reduce((sum, value) => sum + value, 0);
  const displayPercents = totalPercent > 0
    ? rawPercents.map((value) => (value / totalPercent) * 100)
    : options.map(() => (options.length > 0 ? 100 / options.length : 0));
  const totalDisplay = displayPercents.reduce((sum, v) => sum + v, 0);
  const segmentWidths: `${number}%`[] = totalDisplay > 0
    ? displayPercents.map((v) => `${(v / totalDisplay) * 100}%` as `${number}%`)
    : options.map(() => `${100 / options.length}%` as `${number}%`);

    return (
    <Pressable onPress={onPress} className="w-full h-auto rounded-[12px] border-[1px]" style={{ borderColor: ExploreTheme.headerBorder }}>
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
          <View className="w-full mt-2 h-6" style={{ flexDirection: 'row' }}>
            {options.map((option, index) => {
              const color = OPTION_COLORS[index % OPTION_COLORS.length];
              const width = segmentWidths[index];
              const showPercent = options.length === 2;

              return (
                <View
                  key={option.id ?? index}
                  style={{ width }}
                  className="overflow-hidden justify-center items-center"
                >
                  <Text
                    style={{ color, textAlign: 'center' }}
                    className="font-jetbrain-bold text-[14px] leading-[18px]"
                    numberOfLines={1}
                  >
                    {formatOptionLabel(option.name)}{showPercent ? ` ${rawPercents[index].toFixed(0)}%` : ''}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Dynamic Progress Bar */}
          <View className="w-full h-2.5 rounded-xl overflow-hidden mt-1" style={{ flexDirection: 'row' }}>
            {options.map((option, index) => {
              const width = segmentWidths[index];
              const color = OPTION_COLORS[index % OPTION_COLORS.length];
              return (
                <View
                  key={option.id ?? index}
                  style={{ width, backgroundColor: color }}
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

