import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Flame, Plus, Utensils } from "lucide-react";
import { MacroRing } from "@/components/MacroRing";
import { MacroBar } from "@/components/MacroBar";
import { SurfaceCard } from "@/components/SurfaceCard";
import {
  DEFAULT_PROFILE,
  STORAGE_KEYS,
  storage,
  type Meal,
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
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Refeições de hoje</h2>
          <Link
            to="/add"
            className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-glow"
          >
            <Plus className="h-3.5 w-3.5" /> Adicionar
          </Link>
        </div>

        {todayMeals.length === 0 ? (
          <SurfaceCard className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="rounded-full bg-muted p-3">
              <Utensils className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Nenhuma refeição registrada ainda.</p>
            <Link to="/add" className="text-sm font-semibold text-primary">
              Registrar primeira refeição →
            </Link>
          </SurfaceCard>
        ) : (
          <ul className="space-y-2">
            {[...todayMeals].reverse().map((m) => (
              <li key={m.id}>
                <SurfaceCard className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-semibold">{m.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {m.gramas}g · P{m.proteina} · C{m.carbo} · G{m.gordura}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-lg font-bold tabular-nums text-primary">{m.calorias}</p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">kcal</p>
                  </div>
                </SurfaceCard>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
