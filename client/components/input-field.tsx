import React from 'react';
import {View, Text, TextInput, TextInputProps }from 'react-native'

type Props = TextInputProps & {
    label: string;
}

export default function inputField({label, ...props}:Props) {
    return (
        <View className="gap-0">
            <Text className="font-grotesk-bold text-base text-slate-600">{"  "}{label}</Text>
            <TextInput
                className="text-slate-600 font-inter text-[16px] p-3.5 rounded-3xl bg-white border-2 border-[#E2E8F0]"
                {...props}
            />
        </View>
    );
}