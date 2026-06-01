import { useNotes } from "@/context/NoteContext";
import { summarizeNote } from "@/services/gemini";

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import {
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Edit3, Trash2 } from "lucide-react-native";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NoteDetailScreen() {
  const [fontsLoaded] = useFonts({
    Poppins_700Bold,
    Poppins_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const params = useLocalSearchParams();
  const id = (params.id as string) || "1";

  const { notes, deleteNote } = useNotes();
  const note = notes.find((n) => n.id === id);

  const title = note
    ? note.title
    : (params.title as string) || "Design System Ideas";
  const description = note
    ? note.description
    : (params.description as string) ||
    "Use Poppins for headings, Inter for body. Primary color is #6C63FF. Add more glassmorphism.";
  const date = note ? note.date : (params.date as string) || "May 31, 2026";
  const [summary, setSummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);

  const handleSummarize = async () => {
    if (description.length < 20) {
      setSummary("Note is too short to summarize.");
      return;
    }

    try {
      setLoadingSummary(true);

      const result = await summarizeNote(description);

      setSummary(result);
    } catch {
      setSummary("Failed to generate summary.");
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleEdit = () => {
    router.push({
      pathname: "/edit-note",
      params: { id, title, description, date },
    });
  };

  const handleDelete = async () => {
    await deleteNote(id);
    router.back();
  };

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.iconButton}
        >
          <ChevronLeft size={28} color="#1A1A1A" />
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={handleDelete}
            style={[styles.iconButton, styles.deleteButton]}
          >
            <Trash2 size={22} color="#FF6B9D" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleEdit}
            style={[styles.iconButton, styles.editButton]}
          >
            <Edit3 size={22} color="#6C63FF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(100).springify().damping(14)}>
          {/* Metadata */}
          <Text style={styles.dateText}>{date}</Text>

          {/* Title */}
          <Text style={styles.titleText}>{title}</Text>

          {/* Divider */}
          <View style={styles.divider} />

          <TouchableOpacity
            onPress={handleSummarize}
            disabled={loadingSummary}
            style={styles.summaryButton}
          >
            <Text style={styles.summaryButtonText}>
              {loadingSummary
                ? "Generating..."
                : summary
                  ? "✨ Regenerate Summary"
                  : "✨ Generate Summary"}
            </Text>
          </TouchableOpacity>

          {summary ? (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>✨ AI Summary</Text>

              <Text style={styles.summaryText}>{summary}</Text>
            </View>
          ) : null}

          {/* Content */}
          <Animated.Text
            entering={FadeInUp.delay(300).springify().damping(14)}
            style={styles.contentText}
          >
            {description}
          </Animated.Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconButton: {
    padding: 8,
    borderRadius: 12,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  editButton: {
    backgroundColor: "rgba(108, 99, 255, 0.1)",
  },
  deleteButton: {
    backgroundColor: "rgba(255, 107, 157, 0.1)", // #FF6B9D with opacity
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  dateText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: "#A0A0A0",
    marginBottom: 12,
  },
  titleText: {
    fontFamily: "Poppins_700Bold",
    fontSize: 32,
    color: "#1A1A1A",
    lineHeight: 40,
    marginBottom: 24,
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F5",
    marginBottom: 24,
  },
  contentText: {
    fontFamily: "Inter_400Regular",
    fontSize: 18,
    color: "#4A4A4A",
    lineHeight: 28,
  },
  summaryButton: {
    backgroundColor: "#6C63FF",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 24,
  },

  summaryButtonText: {
    color: "#FFFFFF",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15,
  },

  summaryCard: {
    backgroundColor: "#F8F7FF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E8E5FF",
  },

  summaryTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
    color: "#6C63FF",
    marginBottom: 10,
  },

  summaryText: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "#4A4A4A",
    lineHeight: 24,
  },
});
