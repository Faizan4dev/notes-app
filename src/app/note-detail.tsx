import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { ChevronLeft, Edit3, Trash2 } from 'lucide-react-native';
import { useFonts, Poppins_700Bold, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotes } from '@/context/NoteContext';

export default function NoteDetailScreen() {
  const [fontsLoaded] = useFonts({
    Poppins_700Bold,
    Poppins_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const params = useLocalSearchParams();
  const id = params.id as string || '1';
  
  const { notes, deleteNote } = useNotes();
  const note = notes.find((n) => n.id === id);

  const title = note ? note.title : (params.title as string || 'Design System Ideas');
  const description = note ? note.description : (params.description as string || 'Use Poppins for headings, Inter for body. Primary color is #6C63FF. Add more glassmorphism.');
  const date = note ? note.date : (params.date as string || 'May 31, 2026');

  const handleEdit = () => {
    router.push({
      pathname: '/edit-note',
      params: { id, title, description, date }
    });
  };

  const handleDelete = async () => {
    await deleteNote(id);
    router.back();
  };

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <ChevronLeft size={28} color="#1A1A1A" />
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleDelete} style={[styles.iconButton, styles.deleteButton]}>
            <Trash2 size={22} color="#FF6B9D" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleEdit} style={[styles.iconButton, styles.editButton]}>
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
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconButton: {
    padding: 8,
    borderRadius: 12,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editButton: {
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 107, 157, 0.1)', // #FF6B9D with opacity
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  dateText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#A0A0A0',
    marginBottom: 12,
  },
  titleText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 32,
    color: '#1A1A1A',
    lineHeight: 40,
    marginBottom: 24,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F5',
    marginBottom: 24,
  },
  contentText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 18,
    color: '#4A4A4A',
    lineHeight: 28,
  },
});
