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
                duration: 1300,
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
        outputRange: [-140, 240],
    });

    const shellOpacity = progress.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.92, 1, 0.92],
    });

    return (
        <Animated.View style={[styles.shell, style, { opacity: shellOpacity }]}>
            {children}
            <Animated.View
                pointerEvents="none"
                style={[
                    styles.shimmer,
                    {
                        transform: [{ translateX: shimmerTranslateX }],
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
        width: 110,
        backgroundColor: 'rgba(255,255,255,0.35)',
    },
});
