import {Pressable, Text} from 'react-native';
import {useState} from 'react';

type Props = {
    label:string;
    isActive:boolean;
    onPress: () => void;
}

export default function categoryBtn({label, isActive, onPress}:Props) {
    const [pressed, setPressed] = useState(false);
    return(
        <Pressable 
            className="h-[38px] w-[88px] bg-[#0F172A] rounded-full items-center justify-center" 
            onPress={onPress}
            onPressIn={()=>setPressed(true)}
            onPressOut={()=>setPressed(false)}
            style={{
                    backgroundColor: (isActive ? '#0F172A' : '#F8FAFC'),
                    borderWidth: 1,
                    borderColor: (isActive ? '#0F172A' : '#E2E8F0')
                }}
            >
            <Text
            className={ isActive 
                ? "text-white font-grotesk-bold text-[14px]"
                : "text-[#94A3B8] font-grotesk-bold text-[14px]"
            }> 
                {label}
            </Text>
        </Pressable>
    )
}   