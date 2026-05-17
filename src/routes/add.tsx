import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Search, Check } from "lucide-react";
import { FOODS, type Food } from "@/data/foods";
import { SurfaceCard } from "@/components/SurfaceCard";
import { STORAGE_KEYS, storage, type Meal } from "@/storage/storage";
import { calcMealFromFood } from "@/utils/nutrition";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/add")({
  head: () => ({
    meta: [
      { title: "FitDiet — Adicionar refeição" },
      { name: "description", content: "Pesquise alimentos e registre suas refeições rapidamente." },
    ],
  }),
  component: AddMeal,
});

function AddMeal() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Food | null>(null);
  const [gramas, setGramas] = useState(100);

  const results = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return FOODS;
    return FOODS.filter((f) => f.nome.toLowerCase().includes(n));
  }, [q]);

  const preview = selected ? calcMealFromFood(selected, gramas || 0) : null;

  function add() {
    if (!selected || !preview || gramas <= 0) return;
    const meals = storage.get<Meal[]>(STORAGE_KEYS.meals, []);
    const meal: Meal = {
      id: crypto.randomUUID(),
      foodId: selected.id,
      nome: selected.nome,
      gramas,
      ...preview,
      date: new Date().toISOString(),
    };
    storage.set(STORAGE_KEYS.meals, [...meals, meal]);
    navigate({ to: "/" });
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <header className="flex items-center gap-3">
        <Link
          to="/"
          className="rounded-full border border-border bg-card/60 p-2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="font-display text-2xl font-bold">Adicionar refeição</h1>
      </header>

      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Pesquisar alimento…"
          className="h-12 w-full rounded-2xl border border-border bg-card/60 pl-11 pr-4 text-sm outline-none ring-primary/40 backdrop-blur transition focus:ring-2"
        />
      </div>

      {selected && preview && (
        <SurfaceCard className="space-y-4 border-primary/40">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-lg font-semibold">{selected.nome}</h2>
            <button
              onClick={() => setSelected(null)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              trocar
            </button>
          </div>

          <label className="block">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Quantidade (g)</span>
            <input
              type="number"
              min={1}
              value={gramas}
              onChange={(e) => setGramas(Math.max(0, +e.target.value || 0))}
              className="mt-1 h-12 w-full rounded-xl border border-border bg-background/60 px-4 font-display text-xl font-bold tabular-nums outline-none ring-primary/40 focus:ring-2"
            />
          </label>

          <div className="grid grid-cols-4 gap-2">
            <Stat label="kcal" value={preview.calorias} accent />
            <Stat label="Prot" value={preview.proteina} suffix="g" />
            <Stat label="Carb" value={preview.carbo} suffix="g" />
            <Stat label="Gord" value={preview.gordura} suffix="g" />
          </div>

          <button
            onClick={add}
            className="shadow-glow flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-primary-foreground transition-transform active:scale-[0.98]"
          >
            <Check className="h-5 w-5" /> Adicionar refeição
          </button>
        </SurfaceCard>
      )}

      <ul className="space-y-2">
        {results.map((f) => (
          <li key={f.id}>
            <button
              onClick={() => {
                setSelected(f);
                setGramas(100);
              }}
              className="w-full text-left"
            >
              <SurfaceCard
                className={`flex items-center justify-between p-4 transition-colors ${
                  selected?.id === f.id ? "border-primary/60" : "hover:border-border"
                }`}
              >
                <div>
                  <p className="font-semibold">{f.nome}</p>
                  <p className="text-xs text-muted-foreground">
                    {f.calorias} kcal · P{f.proteina} · C{f.carbo} · G{f.gordura} / 100g
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">100g</span>
              </SurfaceCard>
            </button>
          </li>
        ))}
        {results.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">Nenhum alimento encontrado.</p>
        )}
      </ul>
    </div>
  );
}

function Stat({ label, value, suffix = "", accent = false }: { label: string; value: number; suffix?: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-background/40 p-2 text-center">
      <p className={`font-display text-lg font-bold tabular-nums ${accent ? "text-primary" : ""}`}>
        {value}{suffix}
      </p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}
