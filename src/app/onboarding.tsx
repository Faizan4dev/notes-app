import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity, ViewToken } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, interpolate, Extrapolation, SharedValue } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useFonts, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter';
import { NotebookPen, Search, FolderOpen } from 'lucide-react-native';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Capture Every Idea',
    description: 'Write down your thoughts instantly and never lose an idea.',
    colors: ['#FF9A9E', '#FECFEF'], // Soft red to pink
    Icon: NotebookPen,
  },
  {
    id: '2',
    title: 'Find Notes Instantly',
    description: 'Powerful search helps you locate notes in seconds.',
    colors: ['#a18cd1', '#fbc2eb'], // Purple to pink
    Icon: Search,
  },
  {
    id: '3',
    title: 'Stay Organized',
    description: 'Keep your personal and work notes organized beautifully.',
    colors: ['#84fab0', '#8fd3f4'], // Green to blue
    Icon: FolderOpen,
  },
];

const Dot = ({ i, scrollX }: { i: number; scrollX: SharedValue<number> }) => {
  const animatedDotStyle = useAnimatedStyle(() => {
    const widthAnimation = interpolate(
      scrollX.value,
      [(i - 1) * width, i * width, (i + 1) * width],
      [10, 24, 10],
      Extrapolation.CLAMP
    );
    const opacityAnimation = interpolate(
      scrollX.value,
      [(i - 1) * width, i * width, (i + 1) * width],
      [0.5, 1, 0.5],
      Extrapolation.CLAMP
    );
    return {
      width: widthAnimation,
      opacity: opacityAnimation,
    };
  });

  return <Animated.View style={[styles.dot, animatedDotStyle]} />;
};

const Paginator = ({ data, scrollX }: { data: any[]; scrollX: SharedValue<number> }) => {
  return (
    <View style={styles.paginatorContainer}>
      {data.map((_, i) => (
        <Dot key={i.toString()} i={i} scrollX={scrollX} />
      ))}
    </View>
  );
};

export default function OnboardingScreen() {
  const [fontsLoaded] = useFonts({
    Poppins_700Bold,
    Inter_400Regular,
    Inter_500Medium,
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useSharedValue(0);
  const flatListRef = useRef<FlatList>(null);
  const viewableItemsChanged = React.useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index ?? 0);
    }
  }, []);

  const [viewConfig] = useState({ viewAreaCoveragePercentThreshold: 50 });

  if (!fontsLoaded) return null;

  const getItemLayout = (_: any, index: number) => ({
    length: width,
    offset: width * index,
    index,
  });

  const scrollToNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      router.replace('/login');
    }
  };

  const skip = () => {
    router.replace('/login');
  };

  const renderItem = ({ item }: { item: typeof slides[0] }) => {
    return (
      <View style={styles.slide}>
        <LinearGradient colors={item.colors as [string, string]} style={StyleSheet.absoluteFill} />
        
        <View style={styles.illustrationContainer}>
          <View style={styles.iconCircle}>
            <item.Icon size={100} color="#FFFFFF" strokeWidth={1.5} />
          </View>
        </View>

        <View style={styles.cardWrapper}>
          <BlurView intensity={40} tint="light" style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </BlurView>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={(e) => {
          scrollX.value = e.nativeEvent.contentOffset.x;
        }}
        scrollEventThrottle={16}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        getItemLayout={getItemLayout}
      />

      <View style={styles.bottomContainer}>
        <Paginator data={slides} scrollX={scrollX} />
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={skip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={scrollToNext} style={styles.nextButton}>
            <LinearGradient
              colors={['#111111', '#333333']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.nextButtonGradient}
            >
              <Text style={styles.nextText}>
                {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  slide: {
    width,
    height,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationContainer: {
    flex: 0.6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 10,
  },
  cardWrapper: {
    flex: 0.4,
    width: '100%',
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  card: {
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 28,
    color: '#1A1A1A',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#4A4A4A',
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingHorizontal: 32,
    paddingBottom: 48, // Safe area padding could be used here
    zIndex: 99,
    elevation: 99,
  },
  paginatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  dot: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1A1A1A',
    marginHorizontal: 6,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  skipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: '#4A4A4A',
  },
  nextButton: {
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  nextButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});
