import type { WorkoutSet } from "@/storage/storage";
import { isSameLocalDay, localDateKey } from "@/utils/date";

export function isSameDay(a: string, b: string) {
  return isSameLocalDay(a, b);
}

export function setVolume(set: WorkoutSet) {
  return set.carga * set.reps;
}

export function totalVolume(sets: WorkoutSet[]) {
  return sets.reduce((acc, s) => acc + setVolume(s), 0);
}

/** Agrupa séries por nome de exercício, mantendo a ordem de inserção. */
export function groupByExercise(sets: WorkoutSet[]) {
  const map = new Map<string, WorkoutSet[]>();
  for (const s of sets) {
    if (!map.has(s.exerciseName)) map.set(s.exerciseName, []);
    map.get(s.exerciseName)!.push(s);
  }
  return map;
}

/** Maior carga levantada num conjunto de séries (para exibir "recorde" rápido). */
export function maxCarga(sets: WorkoutSet[]) {
  return sets.reduce((max, s) => Math.max(max, s.carga), 0);
}

/**
 * Evolução por dia de um exercício específico: pega a maior carga registrada
 * em cada dia (proxy simples de progressão de força).
 */
export function exerciseEvolution(sets: WorkoutSet[], exerciseName: string) {
  const filtered = sets
    .filter((s) => s.exerciseName === exerciseName)
    .sort((a, b) => +new Date(a.date) - +new Date(b.date));

  const byDay = new Map<string, number>();
  for (const s of filtered) {
    const key = localDateKey(s.date);
    byDay.set(key, Math.max(byDay.get(key) ?? 0, s.carga));
  }

  return Array.from(byDay.entries()).map(([date, carga]) => ({ date, carga }));
}

/** Lista de exercícios já registrados alguma vez (para o seletor de evolução). */
export function distinctExerciseNames(sets: WorkoutSet[]) {
  return Array.from(new Set(sets.map((s) => s.exerciseName))).sort();
}
