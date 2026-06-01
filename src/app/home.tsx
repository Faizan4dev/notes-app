import FAB from "@/components/FAB";
import NoteCard from "@/components/NoteCard";
import SearchBar from "@/components/SearchBar";
import { Inter_400Regular, Inter_500Medium } from "@expo-google-fonts/inter";
import {
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { router } from "expo-router";
import { FileText } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { useNotes } from "@/context/NoteContext";
import { supabase } from "@/lib/supabase"; // Import Supabase to fetch the user

export default function HomeScreen() {
  const [fontsLoaded] = useFonts({
    Poppins_700Bold,
    Poppins_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // State to hold the user's name
  const [userName, setUserName] = useState("User");

  const { notes } = useNotes();

  // Fetch the logged-in user's name on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user?.user_metadata?.full_name) {
        // Grab just the first name (everything before the first space)
        const firstName = user.user_metadata.full_name.split(" ")[0];
        setUserName(firstName);
      } else if (user?.email) {
        // Fallback: Use the first part of their email if no name exists
        const emailName = user.email.split("@")[0];
        setUserName(emailName);
      }
    };

    fetchUserProfile();
  }, []);

  const totalWords = notes.reduce(
    (sum, note) => sum + note.description.split(/\s+/).filter(Boolean).length,
    0,
  );

  const categoryCount = notes.reduce(
    (acc, note) => {
      acc[note.category] = (acc[note.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const topCategory =
    Object.keys(categoryCount).length > 0
      ? Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0][0]
      : "None";

  const lastUpdated = notes.length > 0 ? notes[0].date : "No notes";

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  }, []);

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header Area */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {userName} 👋</Text>
          <Text style={styles.subtitle}>You have {notes.length} notes</Text>
        </View>
        <TouchableOpacity style={styles.avatarContainer}>
          <View style={styles.avatarPlaceholder}>
            {/* Display the first letter of their name */}
            <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.onlineBadge} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>✨ Smart Insights</Text>

        <View style={styles.statsRow}>
          <Text style={styles.statsLabel}>📝 Total Notes</Text>
          <Text style={styles.statsValue}>{notes.length}</Text>
        </View>

        <View style={styles.statsRow}>
          <Text style={styles.statsLabel}>🗂️ Most Used Category</Text>
          <Text style={styles.statsValue}>{topCategory}</Text>
        </View>

        <View style={styles.statsRow}>
          <Text style={styles.statsLabel}>⏱️ Last Updated</Text>
          <Text style={styles.statsValue}>{lastUpdated}</Text>
        </View>
      </View>
      <View style={styles.searchWrapper}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search your notes..."
        />
      </View>

      {/* Notes List */}
      <FlatList
        data={filteredNotes}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <NoteCard
            item={item}
            index={index}
            onPress={() =>
              router.push({
                pathname: "/note-detail",
                params: {
                  id: item.id,
                  title: item.title,
                  description: item.description,
                  date: item.date,
                },
              })
            }
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#6C63FF"
            colors={["#6C63FF"]}
          />
        }
        ListEmptyComponent={() => (
          <Animated.View
            entering={FadeInDown.delay(200)}
            style={styles.emptyContainer}
          >
            <View style={styles.emptyIconCircle}>
              <FileText size={48} color="#6C63FF" strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyTitle}>No notes found</Text>
            <Text style={styles.emptyDescription}>
              {searchQuery
                ? "We couldn't find any notes matching your search."
                : "Create your first note by tapping the plus button below."}
            </Text>
          </Animated.View>
        )}
      />

      {/* Floating Action Button */}
      <FAB onPress={() => router.push("/add-note")} />
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
    paddingTop: 24,
    paddingBottom: 16,
  },
  greeting: {
    fontFamily: "Poppins_700Bold",
    fontSize: 26,
    color: "#1A1A1A",
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: "#666666",
  },
  avatarContainer: {
    position: "relative",
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EBEBFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 20,
    color: "#6C63FF",
  },
  onlineBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  searchWrapper: {
    marginHorizontal: 24,
    marginBottom: 20,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 100, // Make room for FAB
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#EBEBFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 20,
    color: "#1A1A1A",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyDescription: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "#666666",
    textAlign: "center",
    lineHeight: 22,
  },
  statsCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 24,
    marginBottom: 20,
    padding: 18,
    borderRadius: 20,

    shadowColor: "#6C63FF",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },

  statsTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
    color: "#1A1A1A",
    marginBottom: 12,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  statsLabel: {
    fontFamily: "Inter_400Regular",
    color: "#666666",
    fontSize: 14,
  },
  statsValue: {
    fontFamily: "Poppins_700Bold",
    color: "#6C63FF",
    fontSize: 15,
  },
});