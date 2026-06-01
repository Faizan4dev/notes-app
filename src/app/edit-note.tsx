import { useNotes } from "@/context/NoteContext";
import { Inter_400Regular, Inter_500Medium } from "@expo-google-fonts/inter";
import {
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, RefreshCw } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const CATEGORIES = ["Personal", "Work", "Ideas", "Health", "Finance"];

// Reusable animated input wrapper
const AnimatedInputWrapper = ({
  children,
  isFocused,
}: {
  children: React.ReactNode;
  isFocused: boolean;
}) => {
  const borderOpacity = useSharedValue(0);
  const shadowOpacity = useSharedValue(0);

  useEffect(() => {
    borderOpacity.value = withTiming(isFocused ? 1 : 0, { duration: 200 });
    shadowOpacity.value = withTiming(isFocused ? 0.1 : 0, { duration: 200 });
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
      elevation: isFocused ? 4 : 0,
    };
  });

  return (
    <Animated.View
      style={[styles.inputWrapper, animatedBorderStyle, animatedShadowStyle]}
    >
      {children}
    </Animated.View>
  );
};

export default function EditNoteScreen() {
  const [fontsLoaded] = useFonts({
    Poppins_700Bold,
    Poppins_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
  });

  const params = useLocalSearchParams();

  // Initialize state with params if available, otherwise fallback
  const [title, setTitle] = useState(
    (params.title as string) || "Design System Ideas",
  );
  const [description, setDescription] = useState(
    (params.description as string) ||
      "Use Poppins for headings, Inter for body. Primary color is #6C63FF. Add more glassmorphism.",
  );
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[1]); // Mock "Work" category

  const [isTitleFocused, setIsTitleFocused] = useState(false);
  const [isDescFocused, setIsDescFocused] = useState(false);

  const buttonScale = useSharedValue(1);
  const MAX_DESC_LENGTH = 2000;

  const { updateNote } = useNotes();

  const handleUpdate = async () => {
    if (!title.trim() && !description.trim()) {
      router.back();
      return;
    }

    await updateNote(params.id as string, {
      title: title.trim() || "Untitled Note",
      description: description.trim(),
      category: selectedCategory,
    });

    router.back();
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1 }}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <ChevronLeft size={28} color="#1A1A1A" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Note</Text>
            <View style={{ width: 28 }} /> {/* Spacer to center title */}
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View
              entering={FadeInUp.delay(100).springify().damping(14)}
              style={styles.card}
            >
              {/* Title Input */}
              <Text style={styles.label}>Title</Text>
              <AnimatedInputWrapper isFocused={isTitleFocused}>
                <TextInput
                  style={styles.titleInput}
                  placeholder="Enter note title..."
                  placeholderTextColor="#A0A0A0"
                  value={title}
                  onChangeText={setTitle}
                  onFocus={() => setIsTitleFocused(true)}
                  onBlur={() => setIsTitleFocused(false)}
                />
              </AnimatedInputWrapper>

              {/* Category Selector */}
              <Text style={styles.label}>Category</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryContainer}
              >
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setSelectedCategory(cat)}
                      style={[
                        styles.categoryPill,
                        isSelected && styles.categoryPillSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.categoryText,
                          isSelected && styles.categoryTextSelected,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Description Input */}
              <View style={styles.descHeader}>
                <Text style={styles.label}>Description</Text>
                <Text style={styles.charCount}>
                  {description.length}/{MAX_DESC_LENGTH}
                </Text>
              </View>
              <AnimatedInputWrapper isFocused={isDescFocused}>
                <TextInput
                  style={styles.descInput}
                  placeholder="Start typing your thoughts..."
                  placeholderTextColor="#A0A0A0"
                  value={description}
                  onChangeText={(text) => {
                    if (text.length <= MAX_DESC_LENGTH) setDescription(text);
                  }}
                  onFocus={() => setIsDescFocused(true)}
                  onBlur={() => setIsDescFocused(false)}
                  multiline
                  textAlignVertical="top"
                />
              </AnimatedInputWrapper>
            </Animated.View>
          </ScrollView>

          {/* Update Button */}
          <View style={styles.footer}>
            <Pressable
              onPressIn={() => {
                // eslint-disable-next-line react-hooks/immutability
                buttonScale.value = withSpring(0.95);
              }}
              onPressOut={() => {
                // eslint-disable-next-line react-hooks/immutability
                buttonScale.value = withSpring(1);
              }}
              onPress={handleUpdate}
            >
              <Animated.View
                style={[styles.saveButtonWrapper, buttonAnimatedStyle]}
              >
                <LinearGradient
                  colors={["#6C63FF", "#A084FF"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.saveButton}
                >
                  <RefreshCw
                    size={20}
                    color="#FFFFFF"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.saveButtonText}>Update Note</Text>
                </LinearGradient>
              </Animated.View>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 20,
    color: "#1A1A1A",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
  },
  label: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
    color: "#1A1A1A",
    marginBottom: 12,
  },
  inputWrapper: {
    backgroundColor: "#FAFAFA",
    borderRadius: 16,
    borderColor: "transparent",
    borderWidth: 1.5,
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    marginBottom: 24,
  },
  titleInput: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    color: "#1A1A1A",
    paddingHorizontal: 16,
    height: 56,
  },
  categoryContainer: {
    paddingBottom: 24,
    gap: 12,
  },
  categoryPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#F0F0F5",
    marginRight: 12,
  },
  categoryPillSelected: {
    backgroundColor: "#6C63FF",
  },
  categoryText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: "#666666",
  },
  categoryTextSelected: {
    color: "#FFFFFF",
    fontFamily: "Inter_500Medium",
  },
  descHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  charCount: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#A0A0A0",
  },
  descInput: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "#1A1A1A",
    paddingHorizontal: 16,
    paddingVertical: 16,
    height: 180,
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: "#F8F9FF",
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.03)",
  },
  saveButtonWrapper: {
    width: "100%",
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  saveButton: {
    flexDirection: "row",
    borderRadius: 16,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 18,
    color: "#FFFFFF",
  },
});
