import { useNotes } from "@/context/NoteContext";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Save } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Animated, { FadeInUp, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const CATEGORIES = ["Personal", "Work", "Ideas", "Health", "Finance"];

export default function AddNoteScreen() {
  const params = useLocalSearchParams();
  const { notes, addNote, updateNote } = useNotes();
  const noteToEdit = notes.find((n) => n.id === params.id);

  const [title, setTitle] = useState(noteToEdit?.title || "");
  const [description, setDescription] = useState(noteToEdit?.description || "");
  const [selectedCategory, setSelectedCategory] = useState(noteToEdit?.category || CATEGORIES[0]);
  const [isTitleFocused, setIsTitleFocused] = useState(false);
  const [isDescFocused, setIsDescFocused] = useState(false);
  
  const buttonScale = useSharedValue(1);
  const MAX_DESC_LENGTH = 10000;

  const handleGoBack = () => router.canGoBack() ? router.back() : router.replace('/home');

  const handleSave = async () => {
    if (!title.trim() && !description.trim()) {
      handleGoBack();
      return;
    }

    if (noteToEdit) {
      await updateNote(noteToEdit.id, {
        title: title.trim() || "Untitled Note",
        description: description.trim(),
        category: selectedCategory,
      });
    } else {
      await addNote({
        title: title.trim() || "Untitled Note",
        description: description.trim(),
        category: selectedCategory,
      });
    }
    handleGoBack();
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: buttonScale.value }] }));

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}><ChevronLeft size={28} color="#1A1A1A" /></TouchableOpacity>
        <Text style={styles.headerTitle}>{noteToEdit ? "Edit Note" : "New Note"}</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View entering={FadeInUp.delay(100).springify().damping(14)} style={styles.card}>
          <Text style={styles.label}>Title</Text>
          <TextInput style={styles.titleInput} placeholder="Enter title..." value={title} onChangeText={setTitle} />

          <Text style={styles.label}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryContainer}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity key={cat} onPress={() => setSelectedCategory(cat)} style={[styles.categoryPill, selectedCategory === cat && styles.categoryPillSelected]}>
                <Text style={selectedCategory === cat ? styles.categoryTextSelected : styles.categoryText}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.label}>Description</Text>
          <TextInput 
            style={styles.descInput} 
            placeholder="Start typing..." 
            value={description} 
            onChangeText={(t) => t.length <= MAX_DESC_LENGTH && setDescription(t)} 
            multiline 
            selectable={true}
            scrollEnabled={true}
            // @ts-ignore
            userSelect="text" 
          />
          <Text style={styles.charCount}>{description.length}/{MAX_DESC_LENGTH}</Text>
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable onPress={handleSave}>
          <LinearGradient colors={["#6C63FF", "#A084FF"]} style={styles.saveButton}>
            <Save size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.saveButtonText}>Save Note</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FF" },
  header: { flexDirection: "row", justifyContent: "space-between", padding: 24 },
  headerTitle: { fontFamily: "Poppins_700Bold", fontSize: 20 },
  scrollContent: { padding: 24 },
  card: { backgroundColor: "#FFF", borderRadius: 24, padding: 24, elevation: 4 },
  label: { fontFamily: "Poppins_600SemiBold", fontSize: 16, marginBottom: 12 },
  titleInput: { backgroundColor: "#FAFAFA", borderRadius: 16, padding: 16, fontSize: 16, marginBottom: 20 },
  categoryContainer: { paddingBottom: 24, gap: 12 },
  categoryPill: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, backgroundColor: "#F0F0F5" },
  categoryPillSelected: { backgroundColor: "#6C63FF" },
  categoryText: { color: "#666" },
  categoryTextSelected: { color: "#FFF" },
  descInput: { backgroundColor: "#FAFAFA", borderRadius: 16, padding: 16, height: 250, fontSize: 15, lineHeight: 24 },
  charCount: { alignSelf: 'flex-end', marginTop: 8, color: "#A0A0A0" },
  footer: { padding: 24, backgroundColor: "#F8F9FF" },
  saveButton: { height: 60, borderRadius: 16, justifyContent: "center", alignItems: "center", flexDirection: "row" },
  saveButtonText: { color: "#FFF", fontSize: 18, fontFamily: "Poppins_600SemiBold" }
});