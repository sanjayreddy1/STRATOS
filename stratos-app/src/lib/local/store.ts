"use client";

export type StratosStore = {
  profile: any | null;
  roadmap_tasks: any[];
  topics: any[];
  tasks: any[];
  daily_logs: any[];
  workout_logs: any[];
  fitness_metrics: any[];
  practice_logs: any[];
  olq_scores: any[];
  interview_questions: any[];
  flashcards: any[];
  reminders: any[];
  email_preferences: any;
  news_cache: any[];
  saved_articles: any[];
  notebook_entries: any[];
  lesson_progress: Record<string, boolean>;
  lesson_details: Record<string, any>;
  lesson_interview_results: Record<string, any>;
};

const KEY = "stratos_store_v1";

export const defaultStore: StratosStore = {
  profile: null,
  roadmap_tasks: [],
  topics: [],
  tasks: [],
  daily_logs: [],
  workout_logs: [],
  fitness_metrics: [],
  practice_logs: [],
  olq_scores: [],
  interview_questions: [],
  flashcards: [],
  reminders: [],
  email_preferences: { paused_all: false },
  news_cache: [],
  saved_articles: [],
  notebook_entries: [],
  lesson_progress: {},
  lesson_details: {},
  lesson_interview_results: {},
};

export function loadStore(): StratosStore {
  if (typeof window === "undefined") return defaultStore;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultStore;
    const parsed = JSON.parse(raw);
    return { ...defaultStore, ...parsed };
  } catch {
    return defaultStore;
  }
}

export function saveStore(store: StratosStore) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(store));
}

export function updateStore(mutator: (s: StratosStore) => void): StratosStore {
  const s = loadStore();
  mutator(s);
  saveStore(s);
  return s;
}

export function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}
