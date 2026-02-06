import { KeyRound, Wrench, Zap, Paintbrush, Sparkles, Hammer } from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  KeyRound,
  Wrench,
  Zap,
  Paintbrush,
  Sparkles,
  Hammer,
};

interface CategoryIconProps {
  iconName: string;
  className?: string;
}

export default function CategoryIcon({ iconName, className }: CategoryIconProps) {
  const Icon = iconMap[iconName];
  if (!Icon) return null;
  return <Icon className={className} />;
}
