import React from 'react';
import {View, Text, TextInput, TextInputProps }from 'react-native'

type Props = TextInputProps & {
    label: string;
}

export default function inputField({label, ...props}:Props) {
    return (
        <View className="gap-2">
            <Text className="font-grotesk-bold text-base text-[#0F172A]">{label}</Text>
            <TextInput
                className="text-slate-600 font-inter text-[16px] p-4 rounded-2xl bg-slate-200 border-0 outline-none shadow-black shadow-sm"
                {...props}
            />
        </View>
    );
}