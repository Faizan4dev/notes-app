import { Search, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChangeText,
  placeholder = "Search notes...",
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  // Animation values
  const borderOpacity = useSharedValue(0);
  const shadowOpacity = useSharedValue(0);

  useEffect(() => {
    borderOpacity.value = withTiming(isFocused ? 1 : 0, { duration: 200 });
    shadowOpacity.value = withTiming(isFocused ? 0.1 : 0.05, { duration: 200 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused]);

  const animatedBorderStyle = useAnimatedStyle(() => {
    return {
      borderColor: `rgba(108, 99, 255, ${borderOpacity.value})`,
      borderWidth: 1.5,
    };
  });

  const animatedShadowStyle = useAnimatedStyle(() => {
    return {
      shadowOpacity: shadowOpacity.value,
      elevation: isFocused ? 6 : 3,
    };
  });

  return (
    <Animated.View
      style={[styles.container, animatedBorderStyle, animatedShadowStyle]}
    >
      <Search
        size={20}
        color={isFocused ? "#6C63FF" : "#A0A0A0"}
        style={styles.icon}
      />

      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#A0A0A0"
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoCapitalize="none"
        autoCorrect={false}
      />

      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => onChangeText("")}
          style={styles.clearButton}
        >
          <X size={18} color="#A0A0A0" />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderColor: "transparent",
    borderWidth: 1.5,
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: "#1A1A1A",
    // outlineStyle: "none",
    height: "100%",
  },
  clearButton: {
    padding: 8,
    marginRight: -8, // Offset the padding to keep the hit area large but visually aligned
  },
});
