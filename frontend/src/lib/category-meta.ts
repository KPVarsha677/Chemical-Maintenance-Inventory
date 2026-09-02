import {
  Droplets,
  Beaker,
  FlaskConical,
  Flame,
  TestTube,
  Wind,
  Biohazard,
  TestTubes,
  Pipette,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ChemicalCategory } from "@/lib/types";

export const CATEGORY_META: Record<
  ChemicalCategory,
  { icon: LucideIcon; className: string; dot: string }
> = {
  Acid: { icon: Droplets, className: "bg-rose-500/10 text-rose-600 dark:text-rose-400", dot: "bg-rose-500" },
  Base: { icon: Beaker, className: "bg-sky-500/10 text-sky-600 dark:text-sky-400", dot: "bg-sky-500" },
  Solvent: { icon: FlaskConical, className: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400", dot: "bg-indigo-500" },
  Oxidizer: { icon: Flame, className: "bg-orange-500/10 text-orange-600 dark:text-orange-400", dot: "bg-orange-500" },
  Flammable: { icon: Flame, className: "bg-red-500/10 text-red-600 dark:text-red-400", dot: "bg-red-500" },
  Reagent: { icon: TestTube, className: "bg-violet-500/10 text-violet-600 dark:text-violet-400", dot: "bg-violet-500" },
  Gas: { icon: Wind, className: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400", dot: "bg-cyan-500" },
  Biological: { icon: Biohazard, className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" },
  Salt: { icon: TestTubes, className: "bg-amber-500/10 text-amber-600 dark:text-amber-400", dot: "bg-amber-500" },
  Indicator: { icon: Pipette, className: "bg-pink-500/10 text-pink-600 dark:text-pink-400", dot: "bg-pink-500" },
};

export function getCategoryMeta(category: ChemicalCategory) {
  return CATEGORY_META[category] ?? CATEGORY_META.Reagent;
}
