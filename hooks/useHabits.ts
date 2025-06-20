import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

export type Habit = {
  id: string;
  title: string;
  completed: boolean;
};

const HABITS_KEY = "@habits";

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    setLoading(true);
    try {
      const json = await AsyncStorage.getItem(HABITS_KEY);
      if (json) setHabits(JSON.parse(json));
    } catch (e) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const saveHabits = async (newHabits: Habit[]) => {
    setHabits(newHabits);
    await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(newHabits));
  };

  const addHabit = async (title: string) => {
    const newHabit: Habit = {
      id: Date.now().toString(),
      title,
      completed: false,
    };
    await saveHabits([newHabit, ...habits]);
  };

  const toggleHabit = async (id: string) => {
    const newHabits = habits.map((h) =>
      h.id === id ? { ...h, completed: !h.completed } : h
    );
    await saveHabits(newHabits);
  };

  const removeHabit = async (id: string) => {
    const newHabits = habits.filter((h) => h.id !== id);
    await saveHabits(newHabits);
  };

  return {
    habits,
    loading,
    addHabit,
    toggleHabit,
    removeHabit,
    reload: loadHabits,
  };
}
