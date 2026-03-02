import {Prediction} from "../.expo/types/model";
import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import Svg, { Path } from 'react-native-svg';

type Props = {
    prediction: Prediction;
}

const BookmarkIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 7.8C5 6.11984 5 5.27976 5.32698 4.63803C5.6146 4.07354 6.07354 3.6146 6.63803 3.32698C7.27976 3 8.11984 3 9.8 3H14.2C15.8802 3 16.7202 3 17.362 3.32698C17.9265 3.6146 18.3854 4.07354 18.673 4.63803C19 5.27976 19 6.11984 19 7.8V21L12 17L5 21V7.8Z"
      stroke="#141B34"
      strokeWidth={1.5}
      strokeLinejoin="round"
    />
  </Svg>
);


export default function SituationCard({prediction}:Props)  {
  const mediumDate = new Date(prediction.end_date).toLocaleDateString('en-US', { dateStyle: 'medium' }); 
  const yesPercent = prediction.options[0].probability * 100;
  const noPercent = prediction.options[1].probability * 100;
    return (
    <Pressable onPress={()=>{}} className="w-full h-[220px] rounded-[12px] border-[#F1F5F9] border-2">
      <View className="bg-white rounded-2xl overflow-hidden shadow-sm">
        {/* Image Section */}
        {/* <View className="relative">
          <Image
            source={{ uri: prediction.image_url }}
            className="w-full h-60"
            resizeMode="cover"
          />
          
          <Pressable
            onPress={()=>{}}
            className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md active:opacity-70"
          >
            <BookmarkIcon />
          </Pressable>
        </View> */}

        {/* Content Section */}
        <View className="p-5">
          {/* Category and Read Time */}
          <View className="flex-row items-center gap-3 mb-3">
            <Text className="text-[#94A3B8] text-[12px] font-medium font-space-mono">
              {prediction.category}
            </Text>
            <View className="flex-1" />
            {/* <View className="w-1 h-1 bg-gray-300 rounded-full" /> */}
            <View className="bg-[#F8FAFC] rounded-xl px-4 py-2 ">
              <Text className="text-[#94A3B8] text-[12px] font-space-mono">
                Ends {mediumDate}
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text className="text-gray-900 text-[18px] font-semibold mb-2 leading-7 font-grotesk-bold w-1/2">
            {prediction.title}
          </Text>

          <View className="flex-row">
            <Text className="font-space-mono text-[#10B981] text-[14px]">Yes {yesPercent.toFixed(0)}%</Text>
            <View className="flex-1"/>
            <Text className="font-space-mono text-[#EF4444] text-[14px]">No {noPercent.toFixed(0)}%</Text>
          </View>
          <View className="flex-row w-full h-2 rounded-xl overflow-hidden mt-2">
            <View 
              className="bg-[#10B981] rounded-l-xl" 
              style={{ width: `${yesPercent}%` }}
            />
            <View 
              className="bg-[#EF4444] rounded-r-xl" 
              style={{ width: `${noPercent}%` }} 
            />
          </View>

          {/* Description
          <Text className="text-gray-600 text-base leading-6">
            {description}
          </Text> */}
        </View>
      </View>
    </Pressable>
    );
};


