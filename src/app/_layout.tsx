import { Stack } from 'expo-router';
import { NoteProvider } from '@/context/NoteContext';

export default function RootLayout() {
  return (
    <NoteProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="home" />
        <Stack.Screen name="add-note" />
        <Stack.Screen name="edit-note" />
        <Stack.Screen name="note-detail" />
      </Stack>
    </NoteProvider>
  );
}
