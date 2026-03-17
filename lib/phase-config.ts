export const phaseConfig: Record<
  string,
  { icon: string; gradient: string; border: string; badge: string }
> = {
  Foundation: {
    icon: "🧱",
    gradient: "from-amber-500/10 to-orange-500/5",
    border: "border-amber-500/20",
    badge: "bg-amber-500/15 text-amber-400",
  },
  Execution: {
    icon: "⚡",
    gradient: "from-blue-500/10 to-cyan-500/5",
    border: "border-blue-500/20",
    badge: "bg-blue-500/15 text-blue-400",
  },
  Authority: {
    icon: "👑",
    gradient: "from-purple-500/10 to-pink-500/5",
    border: "border-purple-500/20",
    badge: "bg-purple-500/15 text-purple-400",
  },
};

/** Variant with hover borders for interactive cards */
export const phaseConfigInteractive: Record<
  string,
  { icon: string; gradient: string; border: string; badge: string }
> = {
  Foundation: {
    ...phaseConfig.Foundation,
    border: "border-amber-500/20 hover:border-amber-500/40",
  },
  Execution: {
    ...phaseConfig.Execution,
    border: "border-blue-500/20 hover:border-blue-500/40",
  },
  Authority: {
    ...phaseConfig.Authority,
    border: "border-purple-500/20 hover:border-purple-500/40",
  },
};

export const defaultPhaseConfig = {
  icon: "📍",
  gradient: "from-zinc-500/10 to-zinc-500/5",
  border: "border-zinc-500/20",
  badge: "bg-zinc-500/15 text-zinc-400",
};
