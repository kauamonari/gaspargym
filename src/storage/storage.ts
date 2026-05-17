// Web equivalent of AsyncStorage using localStorage.
const isBrowser = typeof window !== "undefined";

export const storage = {
  get<T>(key: string, fallback: T): T {
    if (!isBrowser) return fallback;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set<T>(key: string, value: T) {
    if (!isBrowser) return;
    window.localStorage.setItem(key, JSON.stringify(value));
  },
  remove(key: string) {
    if (!isBrowser) return;
    window.localStorage.removeItem(key);
  },
};

export const STORAGE_KEYS = {
  meals: "fitdiet:meals",
  weights: "fitdiet:weights",
  profile: "fitdiet:profile",
} as const;

export interface Meal {
  id: string;
  foodId: number;
  nome: string;
  gramas: number;
  calorias: number;
  proteina: number;
  carbo: number;
  gordura: number;
  date: string; // ISO
}

export interface WeightEntry {
  id: string;
  weight: number;
  date: string; // ISO
}

export type Goal = "bulking" | "cutting" | "manutencao";

export interface Profile {
  peso: number;
  altura: number;
  idade: number;
  sexo: "M" | "F";
  objetivo: Goal;
}

export const DEFAULT_PROFILE: Profile = {
  peso: 75,
  altura: 175,
  idade: 25,
  sexo: "M",
  objetivo: "manutencao",
};
