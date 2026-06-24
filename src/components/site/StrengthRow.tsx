import { CheckCircle } from "lucide-react";
import type { Strength } from "@/content/strengths";

interface StrengthRowProps {
  strength: Strength;
}

export default function StrengthRow({ strength }: StrengthRowProps) {
  return (
    <div className="flex gap-4">
      <div className="mt-0.5 shrink-0 text-primary-fg">
        <CheckCircle size={20} />
      </div>
      <div>
        <p className="font-semibold text-ink">{strength.strength}</p>
        <p className="mt-1 text-sm text-ink-muted leading-relaxed">{strength.description}</p>
      </div>
    </div>
  );
}
