import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Note {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
}

interface NoteContextType {
  notes: Note[];
  addNote: (note: Omit<Note, 'id' | 'date'>) => Promise<void>;
  updateNote: (id: string, updatedNote: Omit<Note, 'id' | 'date'>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  isLoading: boolean;
}

const NoteContext = createContext<NoteContextType | undefined>(undefined);

const STORAGE_KEY = '@smart-notes-data';

export const NoteProvider = ({ children }: { children: ReactNode }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load notes on mount
  useEffect(() => {
    const loadNotes = async () => {
      try {
        const storedNotes = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedNotes) {
          setNotes(JSON.parse(storedNotes));
        } else {
          // Add default mock data if empty
          const MOCK_NOTES: Note[] = [
            {
              id: '1',
              title: 'Design System Ideas',
              description: 'Use Poppins for headings, Inter for body. Primary color is #6C63FF. Add more glassmorphism.',
              date: 'May 31, 2026',
              category: 'Work',
            },
            {
              id: '2',
              title: 'Grocery List',
              description: 'Milk, Eggs, Bread, Avocados, Coffee beans, Oat milk, Bananas.',
              date: 'May 30, 2026',
              category: 'Personal',
            },
          ];
          setNotes(MOCK_NOTES);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_NOTES));
        }
      } catch (error) {
        console.error('Failed to load notes', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadNotes();
  }, []);

  // Save notes whenever it changes
  useEffect(() => {
    if (!isLoading) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notes)).catch((error) => {
        console.error('Failed to save notes', error);
      });
    }
  }, [notes, isLoading]);

  const addNote = async (noteData: Omit<Note, 'id' | 'date'>) => {
    const dateObj = new Date();
    const dateString = dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    
    const newNote: Note = {
      ...noteData,
      id: Date.now().toString(),
      date: dateString,
    };
    
    setNotes((prevNotes) => [newNote, ...prevNotes]);
  };

  const updateNote = async (id: string, updatedData: Omit<Note, 'id' | 'date'>) => {
    const dateObj = new Date();
    const dateString = dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === id ? { ...note, ...updatedData, date: dateString } : note
      )
    );
  };

  const deleteNote = async (id: string) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
  };

  return (
    <NoteContext.Provider value={{ notes, addNote, updateNote, deleteNote, isLoading }}>
      {children}
    </NoteContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NoteContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NoteProvider');
  }
  return context;
};
