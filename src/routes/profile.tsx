import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Save, User as UserIcon } from "lucide-react";
import { SurfaceCard } from "@/components/SurfaceCard";
import {
  DEFAULT_PROFILE,
  STORAGE_KEYS,
  storage,
  type Goal,
  type Profile,
} from "@/storage/storage";
import { calcMacroGoals } from "@/utils/nutrition";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "FitDiet — Perfil" },
      { name: "description", content: "Configure seus dados e objetivo para calcular calorias diárias." },
    ],
  }),
  component: ProfilePage,
});

const goals: { id: Goal; label: string; desc: string }[] = [
  { id: "cutting", label: "Cutting", desc: "Perder gordura" },
  { id: "manutencao", label: "Manutenção", desc: "Manter peso" },
  { id: "bulking", label: "Bulking", desc: "Ganhar massa" },
];

function ProfilePage() {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setProfile(storage.get(STORAGE_KEYS.profile, DEFAULT_PROFILE));
  }, []);

  function update<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile((p) => ({ ...p, [key]: value }));
    setSaved(false);
  }

  function save() {
    storage.set(STORAGE_KEYS.profile, profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const macros = calcMacroGoals(profile);

  return (
    <div className="space-y-6 animate-slide-up">
      <header className="flex items-center gap-3">
        <div className="rounded-full bg-primary/20 p-3 text-primary">
          <UserIcon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Seu perfil</p>
          <h1 className="font-display text-2xl font-bold">Configurações</h1>
        </div>
      </header>

      <SurfaceCard className="space-y-4">
        <h2 className="font-display text-lg font-semibold">Dados</h2>

        <div className="grid grid-cols-3 gap-3">
          <Field label="Peso (kg)" value={profile.peso} onChange={(v) => update("peso", v)} />
          <Field label="Altura (cm)" value={profile.altura} onChange={(v) => update("altura", v)} />
          <Field label="Idade" value={profile.idade} onChange={(v) => update("idade", v)} />
        </div>

        <div>
          <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Sexo</p>
          <div className="grid grid-cols-2 gap-2">
            {(["M", "F"] as const).map((s) => (
              <button
                key={s}
                onClick={() => update("sexo", s)}
                className={`h-11 rounded-xl border text-sm font-semibold transition ${
                  profile.sexo === s
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-background/40 text-muted-foreground"
                }`}
              >
                {s === "M" ? "Masculino" : "Feminino"}
              </button>
            ))}
          </div>
        </div>
      </SurfaceCard>

      <SurfaceCard className="space-y-3">
        <h2 className="font-display text-lg font-semibold">Objetivo</h2>
        <div className="grid grid-cols-3 gap-2">
          {goals.map((g) => (
            <button
              key={g.id}
              onClick={() => update("objetivo", g.id)}
              className={`flex flex-col items-center gap-1 rounded-xl border p-3 text-center transition ${
                profile.objetivo === g.id
                  ? "border-primary bg-primary/15"
                  : "border-border bg-background/40 hover:border-border"
              }`}
            >
              <span className="text-sm font-semibold">{g.label}</span>
              <span className="text-[10px] text-muted-foreground">{g.desc}</span>
            </button>
          ))}
        </div>
      </SurfaceCard>

      <SurfaceCard className="space-y-4 border-primary/30">
        <h2 className="font-display text-lg font-semibold">Metas calculadas</h2>
        <div className="text-center">
          <p className="font-display text-5xl font-bold tabular-nums text-primary">{macros.calorias}</p>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">kcal por dia</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <Mini label="Proteína" value={macros.proteina} color="protein" />
          <Mini label="Carbo" value={macros.carbo} color="carbs" />
          <Mini label="Gordura" value={macros.gordura} color="fat" />
        </div>
      </SurfaceCard>

      <button
        onClick={save}
        className="shadow-glow sticky bottom-24 flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-semibold text-primary-foreground transition-transform active:scale-[0.98]"
      >
        <Save className="h-5 w-5" />
        {saved ? "Salvo!" : "Salvar perfil"}
      </button>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(+e.target.value || 0)}
        className="mt-1 h-12 w-full rounded-xl border border-border bg-background/60 px-3 font-display text-lg font-bold tabular-nums outline-none ring-primary/40 focus:ring-2"
      />
    </label>
  );
}

function Mini({ label, value, color }: { label: string; value: number; color: "protein" | "carbs" | "fat" }) {
  const colorMap = { protein: "var(--color-protein)", carbs: "var(--color-carbs)", fat: "var(--color-fat)" };
  return (
    <div className="rounded-xl border border-border bg-background/40 p-3">
      <p className="font-display text-xl font-bold tabular-nums" style={{ color: colorMap[color] }}>
        {value}g
      </p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}
