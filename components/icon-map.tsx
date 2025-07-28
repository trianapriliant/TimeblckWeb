import { BookOpen, BrainCircuit, Dumbbell, Footprints, Guitar, Heart, Salad, TrendingUp, Briefcase, Wind, DollarSign, Paintbrush, Users, BedDouble, Coffee, Laptop, Carrot, PiggyBank, Palette, Sparkles, PenSquare, GlassWater, Home, Music, ListChecks, Clapperboard, Gamepad2, Bike, GraduationCap, Code, CookingPot, Dog, Cat, MessageSquare, Phone, ShoppingBag, Trash2, Wrench, Leaf, Plane } from 'lucide-react';
import type { LucideProps } from 'lucide-react';

export const habitIcons = {
  Dumbbell,
  Salad,
  BookOpen,
  Guitar,
  Footprints,
  Heart,
  BrainCircuit,
  TrendingUp,
  Briefcase,
  Wind,
  DollarSign,
  Paintbrush,
  Users,
  BedDouble,
  Coffee,
  Laptop,
  Carrot,
  PiggyBank,
  Palette,
  Sparkles,
  PenSquare,
  GlassWater,
  Home,
  Music,
  ListChecks,
  Clapperboard,
  Gamepad2,
  Bike,
  GraduationCap,
  Code,
  CookingPot,
  Dog,
  Cat,
  MessageSquare,
  Phone,
  ShoppingBag,
  Trash2,
  Wrench,
  Leaf,
  Plane,
};

export const habitIconNames = Object.keys(habitIcons) as Array<keyof typeof habitIcons>;

export type HabitIconName = keyof typeof habitIcons;

export const Icon = ({ name, ...props }: { name: HabitIconName } & LucideProps) => {
    const IconComponent = habitIcons[name];
    if (!IconComponent) return null; // Or return a default icon
    return <IconComponent {...props} />;
};
