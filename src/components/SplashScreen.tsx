import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useFonts, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { NotebookPen } from 'lucide-react-native';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

// A simple particle component
const Particle = ({ delay, startX, startY }: { delay: number; startX: number; startY: number }) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withTiming(-150, { duration: 4000, easing: Easing.linear })
    );
    opacity.value = withDelay(
      delay,
      withTiming(0.4, { duration: 2000 }, () => {
        opacity.value = withTiming(0, { duration: 2000 });
      })
    );
  }, [delay, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
      left: startX,
      top: startY,
    };
  });

  return <Animated.View style={[styles.particle, animatedStyle]} />;
};

const particlesArray = Array.from({ length: 25 }).map((_, i) => ({
  id: i,
  startX: Math.random() * width,
  startY: Math.random() * (height + 150), // Start from bottom
  delay: Math.random() * 3000,
}));

export default function SplashScreen() {
  const [fontsLoaded] = useFonts({
    Poppins_700Bold,
  });

  const logoScale = useSharedValue(0);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    // Logo animation: scale from 0 to 1 with spring
    logoScale.value = withSpring(1, { damping: 12, stiffness: 90 });

    // Text animation: fade in after logo
    textOpacity.value = withDelay(600, withTiming(1, { duration: 800 }));

    // Navigation timer
    const timer = setTimeout(() => {
      router.replace('/onboarding');
    }, 3000);

    return () => clearTimeout(timer);
  }, [logoScale, textOpacity]);

  const logoStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: logoScale.value }],
    };
  });

  const textStyle = useAnimatedStyle(() => {
    return {
      opacity: textOpacity.value,
      transform: [
        {
          translateY: withTiming(textOpacity.value === 1 ? 0 : 15, { duration: 800 }),
        },
      ],
    };
  });

  if (!fontsLoaded) {
    // Return a solid background while fonts load to avoid flash
    return <View style={{ flex: 1, backgroundColor: '#6C63FF' }} />;
  }

  return (
    <LinearGradient
      colors={['#6C63FF', '#A084FF']}
      style={styles.container}
    >
      {/* Background Particles */}
      {particlesArray.map((p) => (
        <Particle key={p.id} delay={p.delay} startX={p.startX} startY={p.startY} />
      ))}

      <View style={styles.content}>
        <Animated.View style={[styles.logoContainer, logoStyle]}>
          <NotebookPen size={64} color="#FFFFFF" strokeWidth={1.5} />
        </Animated.View>

        <Animated.View style={[styles.textContainer, textStyle]}>
          <Text style={styles.title}>Smart Notes</Text>
          <Text style={styles.tagline}>Capture Ideas Anytime, Anywhere</Text>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  logoContainer: {
    width: 120,
    height: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 40,
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#F8F8F8',
    fontWeight: '500',
    letterSpacing: 0.5,
    textAlign: 'center',
    opacity: 0.9,
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 2,
  },
});
