import { supabase } from '@/lib/supabase';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';

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

export const NoteProvider = ({ children }: { children: ReactNode }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const formatDate = (dateString: string) => {
    const dateObj = new Date(dateString);
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const fetchNotes = async (userId: string) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch error:', error);
    } else if (data) {
      const formattedNotes: Note[] = data.map((dbNote) => ({
        id: dbNote.id,
        title: dbNote.title,
        description: dbNote.description,
        category: dbNote.category,
        date: formatDate(dbNote.created_at),
      }));
      setNotes(formattedNotes);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) fetchNotes(user.id);
      else setIsLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        fetchNotes(session.user.id);
      } else {
        setNotes([]);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const addNote = async (noteData: Omit<Note, 'id' | 'date'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert("Error", "You must be logged in to save notes.");
      return;
    }

    const { data, error } = await supabase
      .from('notes')
      .insert([{
        user_id: user.id,
        title: noteData.title,
        description: noteData.description,
        category: noteData.category,
      }])
      .select()
      .single();

    if (error) {
      Alert.alert('Database Error', error.message);
      console.error('Error adding note:', error);
    } else if (data) {
      const newNote: Note = {
        id: data.id,
        title: data.title,
        description: data.description,
        category: data.category,
        date: formatDate(data.created_at),
      };
      setNotes((prevNotes) => [newNote, ...prevNotes]);
    }
  };

  const updateNote = async (id: string, updatedData: Omit<Note, 'id' | 'date'>) => {
    const { data, error } = await supabase
      .from('notes')
      .update({
        title: updatedData.title,
        description: updatedData.description,
        category: updatedData.category,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      Alert.alert('Update Error', error.message);
    } else if (data) {
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === id ? { ...note, ...updatedData, date: formatDate(data.created_at) } : note
        )
      );
    }
  };

  const deleteNote = async (id: string) => {
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (error) {
      Alert.alert('Delete Error', error.message);
    } else {
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
    }
  };

  return (
    <NoteContext.Provider value={{ notes, addNote, updateNote, deleteNote, isLoading }}>
      {children}
    </NoteContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NoteContext);
  if (context === undefined) throw new Error('useNotes must be used within a NoteProvider');
  return context;
};