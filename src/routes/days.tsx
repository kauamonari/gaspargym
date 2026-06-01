import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronRight, TrendingUp } from "lucide-react";
import { SurfaceCard } from "@/components/SurfaceCard";
import {
  DEFAULT_PROFILE,
  MEAL_TYPES,
  STORAGE_KEYS,
  storage,
  type Meal,
  type Profile,
} from "@/storage/storage";
import { calcMacroGoals, sumMeals } from "@/utils/nutrition";

export const Route = createFileRoute("/days")({
  head: () => ({
    meta: [
      { title: "FitDiet — Dias" },
      { name: "description", content: "Compare suas calorias e macros dos dias anteriores." },
    ],
  }),
  component: DaysPage,
});

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function DaysPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    setMeals(storage.get<Meal[]>(STORAGE_KEYS.meals, []));
    setProfile(storage.get(STORAGE_KEYS.profile, DEFAULT_PROFILE));
  }, []);

  const goals = calcMacroGoals(profile);

  const days = useMemo(() => {
    const out: { key: string; date: Date; meals: Meal[] }[] = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const k = dayKey(d);
      const dayMeals = meals.filter((m) => m.date.slice(0, 10) === k);
      out.push({ key: k, date: d, meals: dayMeals });
    }
    return out;
  }, [meals]);

  const recorded = days.filter((d) => d.meals.length > 0);
  const avg = recorded.length
    ? Math.round(recorded.reduce((s, d) => s + sumMeals(d.meals).calorias, 0) / recorded.length)
    : 0;

  const selectedDay = selected ? days.find((d) => d.key === selected) : null;

  return (
    <div className="space-y-6 animate-slide-up">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Histórico</p>
          <h1 className="font-display text-3xl font-bold">Dias</h1>
        </div>
        <Link
          to="/progress"
          className="flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <TrendingUp className="h-3.5 w-3.5" /> Peso
        </Link>
      </header>

      <SurfaceCard className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Média ({recorded.length} dias)</p>
          <p className="font-display text-4xl font-bold tabular-nums">
            {avg}
            <span className="ml-1 text-sm font-medium text-muted-foreground">kcal</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Meta</p>
          <p className="font-display text-xl font-semibold tabular-nums text-muted-foreground">
            {goals.calorias}
          </p>
        </div>
      </SurfaceCard>

      <section className="space-y-2">
        <h2 className="font-display text-lg font-semibold">Últimos 30 dias</h2>
        <ul className="space-y-2">
          {days.map((d) => {
            const totals = sumMeals(d.meals);
            const pct = Math.min((totals.calorias / Math.max(goals.calorias, 1)) * 100, 100);
            const diff = totals.calorias - goals.calorias;
            const isToday = d.key === dayKey(new Date());
            const isOpen = selected === d.key;
            return (
              <li key={d.key}>
                <button
                  onClick={() => setSelected(isOpen ? null : d.key)}
                  className="w-full text-left"
                >
                  <SurfaceCard className="space-y-3 transition-colors hover:border-border">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-display text-base font-semibold capitalize">
                          {isToday
                            ? "Hoje"
                            : d.date.toLocaleDateString("pt-BR", {
                                weekday: "short",
                                day: "2-digit",
                                month: "short",
                              })}
                        </p>
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                          {d.meals.length === 0
                            ? "Sem registros"
                            : `${d.meals.length} ${d.meals.length === 1 ? "item" : "itens"}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-display text-lg font-bold tabular-nums">
                            {totals.calorias}
                          </p>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            {d.meals.length > 0
                              ? `${diff > 0 ? "+" : ""}${diff} vs meta`
                              : `meta ${goals.calorias}`}
                          </p>
                        </div>
                        <ChevronRight
                          className={`h-4 w-4 text-muted-foreground transition-transform ${
                            isOpen ? "rotate-90" : ""
                          }`}
                        />
                      </div>
                    </div>

                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-foreground/80 transition-[width] duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    {isOpen && (
                      <div className="space-y-2 border-t border-border/60 pt-3">
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <MacroPill label="P" value={totals.proteina} goal={goals.proteina} color="protein" />
                          <MacroPill label="C" value={totals.carbo} goal={goals.carbo} color="carbs" />
                          <MacroPill label="G" value={totals.gordura} goal={goals.gordura} color="fat" />
                        </div>
                        {d.meals.length > 0 ? (
                          <ul className="space-y-1">
                            {MEAL_TYPES.map((t) => {
                              const items = d.meals.filter((m) => m.mealType === t.id);
                              if (items.length === 0) return null;
                              const s = sumMeals(items);
                              return (
                                <li
                                  key={t.id}
                                  className="flex items-center justify-between rounded-lg bg-background/40 px-3 py-2 text-xs"
                                >
                                  <span className="text-muted-foreground">
                                    {t.emoji} {t.label}
                                  </span>
                                  <span className="tabular-nums">{s.calorias} kcal</span>
                                </li>
                              );
                            })}
                          </ul>
                        ) : (
                          <p className="py-2 text-center text-xs text-muted-foreground">
                            Nenhuma refeição registrada neste dia.
                          </p>
                        )}
                      </div>
                    )}
                  </SurfaceCard>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {selectedDay && null}
    </div>
  );
}

function MacroPill({
  label,
  value,
  goal,
  color,
}: {
  label: string;
  value: number;
  goal: number;
  color: "protein" | "carbs" | "fat";
}) {
  const colorVar =
    color === "protein"
      ? "var(--color-protein)"
      : color === "carbs"
        ? "var(--color-carbs)"
        : "var(--color-fat)";
  return (
    <div className="rounded-lg bg-background/40 px-2 py-1.5">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-xs font-semibold tabular-nums" style={{ color: colorVar }}>
        {value.toFixed(0)}
        <span className="text-muted-foreground"> / {goal}g</span>
      </p>
    </div>
  );
}
