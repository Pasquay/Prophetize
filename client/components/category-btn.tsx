import {Pressable, Text} from 'react-native';
import {useState} from 'react';
import { ExploreTheme } from '../constants/explore-theme';

type Props = {
    label:string;
    isActive:boolean;
    onPress: () => void;
}

export default function categoryBtn({label, isActive, onPress}:Props) {
    const [pressed, setPressed] = useState(false);
    return(
        <Pressable 
            className="h-[38px] w-[88px] rounded-full items-center justify-center"
            onPress={onPress}
            onPressIn={()=>setPressed(true)}
            onPressOut={()=>setPressed(false)}
            style={{
                    backgroundColor: (isActive ? ExploreTheme.titleText : 'white'),
                    borderWidth: 1,
                    borderColor: (isActive ? ExploreTheme.titleText : ExploreTheme.headerBorder)
                }}
            >
            <Text
            className="font-grotesk-bold text-[14px]"
            style={{ color: isActive ? 'white' : ExploreTheme.secondaryText }}
            >
                {label}
            </Text>
        </Pressable>
    )
}   