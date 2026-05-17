import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Flame, Plus, Trash2 } from "lucide-react";
import { MacroRing } from "@/components/MacroRing";
import { MacroBar } from "@/components/MacroBar";
import { SurfaceCard } from "@/components/SurfaceCard";
import {
  DEFAULT_PROFILE,
  MEAL_TYPES,
  STORAGE_KEYS,
  storage,
  type Meal,
  type MealType,
  type Profile,
} from "@/storage/storage";
import { calcMacroGoals, isSameDay, sumMeals } from "@/utils/nutrition";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FitDiet — Hoje" },
      { name: "description", content: "Suas calorias e macros de hoje em um único lugar." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [meals, setMeals] = useState<Meal[]>([]);

  useEffect(() => {
    setProfile(storage.get(STORAGE_KEYS.profile, DEFAULT_PROFILE));
    setMeals(storage.get<Meal[]>(STORAGE_KEYS.meals, []));
  }, []);

  const today = new Date().toISOString();
  const todayMeals = meals.filter((m) => isSameDay(m.date, today));
  const totals = sumMeals(todayMeals);
  const goals = calcMacroGoals(profile);
  const remaining = Math.max(0, goals.calorias - totals.calorias);

  function removeMeal(id: string) {
    const next = meals.filter((m) => m.id !== id);
    setMeals(next);
    storage.set(STORAGE_KEYS.meals, next);
  }

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  })();

  return (
    <div className="space-y-6 animate-slide-up">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{greeting}</p>
          <h1 className="font-display text-3xl font-bold">Seu dia</h1>
        </div>
        <div className="rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
          {new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
        </div>
      </header>

      <SurfaceCard className="relative overflow-hidden">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
        <div className="flex flex-col items-center">
          <MacroRing value={totals.calorias} goal={goals.calorias} />
          <div className="mt-4 flex items-center gap-2 rounded-full border border-border bg-background/40 px-4 py-1.5 text-sm">
            <Flame className="h-4 w-4 text-primary" />
            <span className="font-medium tabular-nums">{remaining}</span>
            <span className="text-muted-foreground">kcal restantes</span>
          </div>
        </div>
      </SurfaceCard>

      <SurfaceCard className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Macros</h2>
          <span className="text-xs text-muted-foreground">Objetivo: {profile.objetivo}</span>
        </div>
        <MacroBar label="Proteína" value={totals.proteina} goal={goals.proteina} color="protein" />
        <MacroBar label="Carboidrato" value={totals.carbo} goal={goals.carbo} color="carbs" />
        <MacroBar label="Gordura" value={totals.gordura} goal={goals.gordura} color="fat" />
      </SurfaceCard>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold">Refeições de hoje</h2>
        <div className="space-y-3">
          {MEAL_TYPES.map((t) => {
            const items = todayMeals.filter((m) => m.mealType === t.id);
            const sub = sumMeals(items);
            return <MealSection key={t.id} type={t.id} label={t.label} emoji={t.emoji} items={items} kcal={sub.calorias} onRemove={removeMeal} />;
          })}
        </div>
      </section>
    </div>
  );
}

function MealSection({
  type,
  label,
  emoji,
  items,
  kcal,
  onRemove,
}: {
  type: MealType;
  label: string;
  emoji: string;
  items: Meal[];
  kcal: number;
  onRemove: (id: string) => void;
}) {
  return (
    <SurfaceCard className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl leading-none">{emoji}</span>
          <div>
            <p className="font-display font-semibold leading-tight">{label}</p>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              {items.length} {items.length === 1 ? "item" : "itens"} · {kcal} kcal
            </p>
          </div>
        </div>
        <Link
          to="/add"
          search={{ type }}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow transition-transform active:scale-95"
          aria-label={`Adicionar em ${label}`}
        >
          <Plus className="h-4 w-4" />
        </Link>
      </div>

      {items.length > 0 && (
        <ul className="space-y-1.5 border-t border-border/60 pt-3">
          {items.map((m) => (
            <li
              key={m.id}
              className="flex items-center justify-between rounded-xl bg-background/40 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{m.nome}</p>
                <p className="text-[11px] text-muted-foreground">
                  {m.gramas}g · P{m.proteina} · C{m.carbo} · G{m.gordura}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="font-display text-sm font-bold tabular-nums text-primary">{m.calorias}</p>
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground">kcal</p>
                </div>
                <button
                  onClick={() => onRemove(m.id)}
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  aria-label="Remover"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </SurfaceCard>
  );
}
