import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isoWeek);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

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
  const today = dayjs();
  const sevenDaysAgo = today.subtract(6, "day").startOf("day"); // Bugün dahil 7 gün
  
  const filteredEntries = entries.filter((e) => {
    const entryDate = dayjs(e.date);
    const isInLast7Days = entryDate.isSameOrAfter(sevenDaysAgo, "day") && 
                          entryDate.isSameOrBefore(today, "day");
    
    return isInLast7Days;
  });
  
  return filteredEntries;
};

// AsyncStorage.clear();
