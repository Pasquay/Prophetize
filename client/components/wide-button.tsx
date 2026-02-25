import React, {useState} from 'react';
import { Text, Pressable } from 'react-native';

type Props = {
    label: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary';
    icon?: React.ReactNode;
    disabled?: boolean;
}

export default function Button({label, onPress, variant="primary", icon, disabled}:Props) {
    const [pressed, setPressed] = useState(false);

    return (
            <Pressable 
                disabled={disabled}
                onPress={onPress} 
                onPressIn={()=>setPressed(true)}
                onPressOut={()=>setPressed(false)}
                className={`flex-row items-center justify-center p-4 rounded-2xl gap-[8px]`}
                style={{
                    opacity: pressed ? 0.7 : 1,
                    backgroundColor: pressed
                        ? (variant === 'primary' ? '#2a7a9e' : '#e2e8f0')
                        : (variant === 'primary' ? '#87CEEB' : '#ffffff'),
                    borderWidth: variant === 'secondary' ? 1 : 0,
                    borderColor: '#E2E8F0'
                }}
            >
                {icon && icon} 
                <Text
                    className={ variant === 'primary' 
                        ? "text-white font-grotesk-bold text-[16px]"
                        : "font-grotesk-bold text-[16px] text-[#0F172A]"
                    }> 
                    {label}</Text>
            </Pressable>
    );
}
