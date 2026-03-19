import React, { useEffect, useRef } from 'react';
import { Animated, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

type Props = {
    style?: StyleProp<ViewStyle>;
    children: React.ReactNode;
};

export default function SkeletonShell({ style, children }: Props) {
    const progress = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const loop = Animated.loop(
            Animated.timing(progress, {
                toValue: 1,
                duration: 1800,
                useNativeDriver: true,
                isInteraction: false,
            })
        );

        loop.start();

        return () => {
            loop.stop();
            progress.stopAnimation();
        };
    }, [progress]);

    const shimmerTranslateX = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [-200, 400],
    });

    const shimmerOpacity = progress.interpolate({
        inputRange: [0, 0.3, 0.5, 0.7, 1],
        outputRange: [0, 0.6, 0.8, 0.6, 0],
    });

    return (
        <Animated.View style={[styles.shell, style]}>
            {children}
            <Animated.View
                pointerEvents="none"
                style={[
                    styles.shimmer,
                    {
                        transform: [{ translateX: shimmerTranslateX }],
                        opacity: shimmerOpacity,
                    },
                ]}
            />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    shell: {
        overflow: 'hidden',
    },
    shimmer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 150,
        backgroundColor: 'rgba(255,255,255,0.5)',
    },
});
