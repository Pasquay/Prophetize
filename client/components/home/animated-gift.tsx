import React, { useState, useRef } from 'react';
import { Animated, Easing, TouchableWithoutFeedback, View, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { UI_COLORS } from '@/constants/ui-tokens';

const AnimatedGift = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Animation values
  const scaleValue = useRef(new Animated.Value(1)).current;
  const shakeValue = useRef(new Animated.Value(0)).current;

  const handleOpenGift = () => {
    if (isOpen) return; // Prevent re-animating if already open

    // The Animation Sequence: Wiggle -> Pop -> Swap Icon
    Animated.sequence([
      // 1. Wiggle/Shake the box
      Animated.timing(shakeValue, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeValue, { toValue: -1, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeValue, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeValue, { toValue: 0, duration: 80, useNativeDriver: true }),
      
      // 2. Scale up (Pop)
      Animated.timing(scaleValue, {
        toValue: 1.3,
        duration: 150,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      // 3. Settle back to normal size
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start(() => {
      // 4. Change the icon to the open state once the animation finishes
      setIsOpen(true);
    });
  };

  // Interpolate the shake value into rotation degrees
  const spin = shakeValue.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-15deg', '15deg']
  });

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={handleOpenGift}>
        <Animated.View style={{ transform: [{ scale: scaleValue }, { rotate: spin }] }}>
          <MaterialCommunityIcons 
            // Swap the icon name based on state!
            name={isOpen ? "gift-open-outline" : "gift-outline"} 
            size={24} 
            color={UI_COLORS.accent} 
          />
        </Animated.View>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  }
});

export default AnimatedGift;
