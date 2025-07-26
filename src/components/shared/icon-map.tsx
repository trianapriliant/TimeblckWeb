
import { BookOpen, BrainCircuit, Dumbbell, Footprints, Guitar, Heart, Salad, TrendingUp, Briefcase, Wind, DollarSign, Paintbrush, Users, BedDouble, Coffee, Laptop, Carrot, PiggyBank, Palette, Sparkles, PenSquare, GlassWater, Home, Music, ListChecks, Clapperboard, Gamepad2, Bike, GraduationCap, Code, CookingPot, Dog, Cat, MessageSquare, Phone, ShoppingBag, Trash2, Wrench, Leaf, Plane, Target, Smile, Annoyed, HandCoins, Drama, LandPlot, Bus, Car, Train, Rocket, Anchor, Bath, Building, Calendar, Camera, CircleDollarSign, Cloud, Crown, Ear, Eye, Factory, Hourglass } from 'lucide-react';
import type { LucideProps } from 'lucide-react';

export const habitIcons = {
  // Free Icons (first 30)
  Target,
  Dumbbell,
  Salad,
  BookOpen,
  Footprints,
  BrainCircuit,
  TrendingUp,
  BedDouble,
  GlassWater,
  Wind,
  Heart,
  Briefcase,
  DollarSign,
  PiggyBank,
  Users,
  PenSquare,
  CookingPot,
  Bike,
  Code,
  GraduationCap,
  Music,
  Guitar,
  Paintbrush,
  Palette,
  Coffee,
  Laptop,
  MessageSquare,
  Phone,
  Home,
  ListChecks,
  Hourglass,

  // Premium Icons
  Sparkles,
  Clapperboard,
  Gamepad2,
  Dog,
  Cat,
  ShoppingBag,
  Leaf,
  Plane,
  Wrench,
  Trash2,
  Smile,
  Annoyed,
  HandCoins,
  Drama,
  LandPlot,
  Bus,
  Car,
  Train,
  Rocket,
  Anchor,
  Bath,
  Building,
  Calendar,
  Camera,
  CircleDollarSign,
  Cloud,
  Crown,
  Ear,
  Eye,
  Factory,
};

export const habitIconNames = Object.keys(habitIcons) as Array<keyof typeof habitIcons>;

export type HabitIconName = keyof typeof habitIcons;

export const Icon = ({ name, ...props }: { name: HabitIconName } & LucideProps) => {
    const IconComponent = habitIcons[name];
    if (!IconComponent) return null; // Or return a default icon
    return <IconComponent {...props} />;
};
