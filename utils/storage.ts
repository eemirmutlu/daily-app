import AsyncStorage from "@react-native-async-storage/async-storage";

export type Entry = {
  id: string;
  mood: string; // emoji
  content: string;
  date: string; // ISO string
};

const ENTRIES_KEY = "mood_journal_entries";

export const saveEntry = async (entry: Entry): Promise<void> => {
  const entries = await getAllEntries();
  entries.unshift(entry); // add new entry to the top
  await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
};

export const getAllEntries = async (): Promise<Entry[]> => {
  const data = await AsyncStorage.getItem(ENTRIES_KEY);
  return data ? JSON.parse(data) : [];
};

export const getEntriesByWeek = async (): Promise<Entry[]> => {
  const entries = await getAllEntries();
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
  return entries.filter((e) => new Date(e.date) >= startOfWeek);
};

// AsyncStorage.clear();
