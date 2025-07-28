
import { Award, Star, Trophy, Sparkles, CheckCircle, Layers, BrainCircuit, Target, Sunrise, Moon, ShieldCheck, Clock, Calendar, Zap, HardHat, Coffee, Bed, PiggyBank, Users, Palette, Feather, Infinity, Rocket, Bot, Crown, Globe } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { TimeBlock, Habit, Goal } from './types';
import { getDay, getMonth } from 'date-fns';

export interface AchievementDefinition {
    id: string;
    title: string;
    description: string;
    icon: LucideIcon;
    isSecret?: boolean;
    check: (data: UserData) => boolean;
}

interface UserData {
    blocksByDate: Record<string, TimeBlock[]>;
    recurringBlocksCount: number;
    habits: Habit[];
    habitData: Map<string, number>;
    goals: Goal[];
    settings: { isPremium: boolean };
}

export const achievementList: AchievementDefinition[] = [
    // --- Onboarding & First Steps ---
    {
        id: 'first_block',
        title: 'Perencana Pertama',
        description: 'Jadwalkan blok waktu pertamamu.',
        icon: Star,
        check: ({ blocksByDate }) => Object.values(blocksByDate).some(day => day.length > 0),
    },
    {
        id: 'first_habit',
        title: 'Pembangun Rutinitas',
        description: 'Buat habit pertamamu untuk dilacak.',
        icon: Award,
        check: ({ habits }) => habits.length > 0,
    },
    {
        id: 'first_checkin',
        title: 'Pemeriksa Konsisten',
        description: 'Selesaikan check-in habit pertamamu.',
        icon: CheckCircle,
        check: ({ habitData }) => habitData.size > 0,
    },
    {
        id: 'first_template',
        title: 'Master Template',
        description: 'Buat template pertamamu untuk rutinitas.',
        icon: Layers,
        check: ({ recurringBlocksCount }) => recurringBlocksCount > 0,
    },
    {
        id: 'first_goal',
        title: 'Pemimpi Besar',
        description: 'Tetapkan Goal pertamamu.',
        icon: Target,
        check: ({ goals }) => goals.length > 0,
    },
    
    // --- Consistency & Streaks ---
    {
        id: 'streak_7_day',
        title: 'Streak 7 Hari',
        description: 'Check-in setiap hari selama satu minggu penuh.',
        icon: Trophy,
        check: ({ habitData, habits }) => {
            if (habits.length === 0) return false;
            const today = new Date();
            for (let i = 0; i < 7; i++) {
                const day = new Date(today);
                day.setDate(today.getDate() - i);
                const dateKey = day.toISOString().split('T')[0];
                const hasCheckin = habits.some(h => habitData.has(`${h.id}__${dateKey}`));
                if (!hasCheckin) return false;
            }
            return true;
        },
    },
    {
        id: 'streak_30_day',
        title: 'Streak 30 Hari',
        description: 'Check-in setiap hari selama 30 hari berturut-turut.',
        icon: Crown,
        check: ({ habitData, habits }) => {
             if (habits.length === 0) return false;
            const today = new Date();
            for (let i = 0; i < 30; i++) {
                const day = new Date(today);
                day.setDate(today.getDate() - i);
                const dateKey = day.toISOString().split('T')[0];
                const hasCheckin = habits.some(h => habitData.has(`${h.id}__${dateKey}`));
                if (!hasCheckin) return false;
            }
            return true;
        },
    },
     {
        id: 'perfect_week_checkin',
        title: 'Minggu Sempurna',
        description: 'Lakukan check-in untuk satu habit setiap hari dalam seminggu.',
        icon: ShieldCheck,
        check: ({ habitData, habits }) => {
             return habits.some(habit => {
                const today = new Date();
                const dayOfWeek = getDay(today);
                for (let i = 0; i <= dayOfWeek; i++) {
                    const day = new Date(today);
                    day.setDate(today.getDate() - i);
                    const dateKey = day.toISOString().split('T')[0];
                    if (!habitData.has(`${habit.id}__${dateKey}`)) return false;
                }
                return true;
            });
        },
    },

    // --- Time Management Mastery ---
    {
        id: 'full_day_scheduled',
        title: 'Arsitek Waktu',
        description: 'Jadwalkan setiap slot waktu dalam satu hari (24 jam penuh).',
        icon: HardHat,
        check: ({ blocksByDate, recurringBlocksCount }) => {
            return Object.values(blocksByDate).some(dayBlocks => {
                let totalDuration = 0;
                dayBlocks.forEach(b => totalDuration += b.duration);
                // 144 slots = 24 hours * 6 slots/hr
                return totalDuration >= 144;
            });
        },
    },
    {
        id: 'productivity_marathon',
        title: 'Maraton Produktivitas',
        description: 'Jadwalkan 40 jam aktivitas dalam seminggu.',
        icon: BrainCircuit,
        check: ({ blocksByDate }) => {
            const today = new Date();
            let totalDuration = 0;
            for (let i = 0; i < 7; i++) {
                const day = new Date(today);
                day.setDate(today.getDate() - i);
                const dateKey = day.toISOString().split('T')[0];
                const dayBlocks = blocksByDate[dateKey] || [];
                dayBlocks.forEach(b => totalDuration += b.duration);
            }
            // 40 hours * 6 slots/hr = 240 slots
            return totalDuration >= 240;
        },
    },
    {
        id: 'early_bird',
        title: 'Bangun Pagi',
        description: 'Jadwalkan & selesaikan aktivitas sebelum jam 6 pagi.',
        icon: Sunrise,
        check: ({ blocksByDate }) => {
            return Object.values(blocksByDate).flat().some(block => block.startTime < (6 * 6));
        },
    },
    {
        id: 'night_owl',
        title: 'Penjelajah Malam',
        description: 'Jadwalkan aktivitas setelah tengah malam.',
        icon: Moon,
        check: ({ blocksByDate }) => {
            return Object.values(blocksByDate).flat().some(block => block.startTime < (3 * 6)); // Before 3am
        },
    },
    {
        id: 'colorful_day',
        title: 'Penuh Warna',
        description: 'Gunakan 5 warna blok yang berbeda dalam sehari.',
        icon: Palette,
        check: ({ blocksByDate }) => {
            return Object.values(blocksByDate).some(dayBlocks => {
                const colors = new Set(dayBlocks.map(b => b.color));
                return colors.size >= 5;
            });
        },
    },
     {
        id: 'planner_pro',
        title: 'Perencana Pro',
        description: 'Jadwalkan lebih dari 100 blok waktu secara total.',
        icon: Calendar,
        check: ({ blocksByDate }) => {
            const totalBlocks = Object.values(blocksByDate).reduce((sum, day) => sum + day.length, 0);
            return totalBlocks >= 100;
        },
    },
    
    // --- Habit & Goal Milestones ---
    {
        id: 'habit_collector_5',
        title: 'Kolektor Kebiasaan',
        description: 'Lacak 5 kebiasaan berbeda secara bersamaan.',
        icon: Layers,
        check: ({ habits }) => habits.length >= 5,
    },
    {
        id: 'habit_collector_10',
        title: 'Kolektor Ahli',
        description: 'Lacak 10 kebiasaan berbeda secara bersamaan.',
        icon: Infinity,
        check: ({ habits }) => habits.length >= 10,
    },
     {
        id: 'goal_setter_5',
        title: 'Pencari Visi',
        description: 'Tetapkan 5 tujuan berbeda.',
        icon: Rocket,
        check: ({ goals }) => goals.length >= 5,
    },
    {
        id: 'well_rounded',
        title: 'Serba Bisa',
        description: 'Miliki setidaknya satu habit di setiap dari 5 pilar.',
        icon: Globe,
        check: ({ habits }) => {
            const pillars = new Set(habits.map(h => h.pillar));
            return pillars.size >= 5;
        },
    },

    // --- Miscellaneous & Fun ---
    {
        id: 'time_traveler',
        title: 'Penjelajah Waktu',
        description: 'Gunakan aplikasi selama 3 bulan berbeda.',
        icon: Clock,
        check: ({ habitData }) => {
            const months = new Set<number>();
            habitData.forEach((_, key) => {
                const dateStr = key.split('__')[1];
                if (dateStr) {
                    months.add(getMonth(new Date(dateStr)));
                }
            });
            return months.size >= 3;
        },
    },
    {
        id: 'quick_add',
        title: 'Gerak Cepat',
        description: 'Tambahkan 5 blok dalam satu sesi.',
        icon: Zap,
        check: () => false, // This needs to be tracked within a session, tricky with current setup
    },
    {
        id: 'coffee_break',
        title: 'Waktunya Kopi',
        description: 'Jadwalkan blok berjudul "Kopi" atau "Coffee".',
        icon: Coffee,
        check: ({ blocksByDate }) => {
            const title = "kopi";
            return Object.values(blocksByDate).flat().some(b => b.title.toLowerCase().includes(title));
        },
    },
     {
        id: 'sweet_dreams',
        title: 'Mimpi Indah',
        description: 'Jadwalkan blok tidur lebih dari 8 jam.',
        icon: Bed,
        check: ({ blocksByDate }) => {
            const title = "tidur";
            // 8 hours * 6 slots/hr = 48 slots
            return Object.values(blocksByDate).flat().some(b => b.title.toLowerCase().includes(title) && b.duration >= 48);
        },
    },
    {
        id: 'money_mind',
        title: 'Pikiran Cuan',
        description: 'Jadwalkan blok terkait keuangan.',
        icon: PiggyBank,
        check: ({ blocksByDate }) => {
            const keywords = ['finance', 'budget', 'invest', 'keuangan'];
            return Object.values(blocksByDate).flat().some(b => keywords.some(k => b.title.toLowerCase().includes(k)));
        },
    },
     {
        id: 'social_butterfly',
        title: 'Kupu-kupu Sosial',
        description: 'Jadwalkan acara sosial.',
        icon: Users,
        check: ({ blocksByDate }) => {
            const keywords = ['social', 'friends', 'family', 'date', 'teman', 'keluarga'];
            return Object.values(blocksByDate).flat().some(b => keywords.some(k => b.title.toLowerCase().includes(k)));
        },
    },
     {
        id: 'creative_spark',
        title: 'Percikan Kreatif',
        description: 'Jadwalkan blok waktu untuk hobi kreatif.',
        icon: Sparkles,
        check: ({ blocksByDate }) => {
            const keywords = ['hobby', 'creative', 'music', 'paint', 'write', 'hobi', 'kreatif', 'musik', 'lukis', 'tulis'];
            return Object.values(blocksByDate).flat().some(b => keywords.some(k => b.title.toLowerCase().includes(k)));
        },
    },
    
    // --- Secret/Premium Achievements ---
    {
        id: 'premium_user',
        title: 'Pendukung Sejati',
        description: 'Upgrade ke akun premium. Terima kasih!',
        icon: Feather,
        isSecret: true,
        check: ({ settings }) => settings.isPremium,
    },
];
