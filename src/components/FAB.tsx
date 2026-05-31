import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withDelay,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus } from 'lucide-react-native';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface FABProps {
  onPress: () => void;
}

export default function FAB({ onPress }: FABProps) {
  // Entrance animation
  const scale = useSharedValue(0);
  
  // Pulse animation (for shadow/glow)
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.5);

  useEffect(() => {
    // Initial entrance pop
    scale.value = withDelay(600, withSpring(1, { damping: 12, stiffness: 90 }));

    // Continuous pulse effect behind the button
    pulseScale.value = withDelay(
      1000,
      withRepeat(
        withTiming(1.4, { duration: 1500, easing: Easing.out(Easing.ease) }),
        -1, // Infinite
        false
      )
    );
    
    pulseOpacity.value = withDelay(
      1000,
      withRepeat(
        withTiming(0, { duration: 1500, easing: Easing.out(Easing.ease) }),
        -1, // Infinite
        false
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  return (
    <View style={styles.container}>
      {/* Pulsing glow layer */}
      <Animated.View style={[styles.pulseCircle, pulseAnimatedStyle]} />
      
      {/* Main interactive button */}
      <AnimatedTouchable
        style={[styles.buttonWrapper, buttonAnimatedStyle]}
        activeOpacity={0.8}
        onPress={onPress}
      >
        <LinearGradient
          colors={['#6C63FF', '#A084FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <Plus size={28} color="#FFFFFF" strokeWidth={2.5} />
        </LinearGradient>
      </AnimatedTouchable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseCircle: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#6C63FF',
  },
  buttonWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },
  gradient: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
