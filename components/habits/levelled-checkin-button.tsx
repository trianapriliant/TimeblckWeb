
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { BLOCK_COLORS, type BlockColor } from '@/lib/types';
import { Check } from 'lucide-react';
import { getContrastingTextColor } from '@/lib/utils';

interface LevelledCheckinButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  intensity: number; // 0-4
  color: BlockColor;
}

const Segment = ({
  isActive,
  color,
  path,
  isCustomColor
}: {
  isActive: boolean;
  color: BlockColor;
  path: string;
  isCustomColor: boolean;
}) => {
  const activeClass = !isCustomColor ? `fill-${color}-500` : ''; 
  const inactiveClass = 'fill-muted/50';

  const style = isCustomColor && isActive ? { fill: color } : {};

  return (
    <path
      d={path}
      className={cn(
        'transition-colors duration-300',
        isActive ? activeClass : inactiveClass
      )}
      style={style}
    />
  );
};

export const LevelledCheckinButton = React.forwardRef<HTMLButtonElement, LevelledCheckinButtonProps>(
  ({ intensity, color, className, ...props }, ref) => {
    const isCustomColor = typeof color === 'string' && color.startsWith('#');
    
    // Determine the color for the checkmark icon
    let foregroundColorStyle: React.CSSProperties = {};
    let foregroundColorClass: string = '';

    if (isCustomColor) {
      foregroundColorStyle.color = getContrastingTextColor(color);
    } else {
      const colorName = color as keyof typeof BLOCK_COLORS;
      foregroundColorClass = BLOCK_COLORS[colorName]?.foreground || 'text-primary-foreground';
    }
    
    // SVG paths for 4 thicker, distinct segments.
    // Outer radius is 40, inner is now 20 (was 30).
    const paths = [
      "M25.4,17.4 A40,40 0 0,1 74.6,17.4 L69.6,22.4 A30,30 0 0,0 30.4,22.4 Z", // Top
      "M82.6,25.4 A40,40 0 0,1 82.6,74.6 L77.6,69.6 A30,30 0 0,0 77.6,30.4 Z", // Right
      "M74.6,82.6 A40,40 0 0,1 25.4,82.6 L30.4,77.6 A30,30 0 0,0 69.6,77.6 Z", // Bottom
      "M17.4,74.6 A40,40 0 0,1 17.4,25.4 L22.4,30.4 A30,30 0 0,0 22.4,69.6 Z", // Left
    ];

    // Special case for Tailwind JIT compiler to recognize dynamic fill classes
    const hiddenColorClasses = `
      fill-red-500 fill-lime-500 fill-teal-500 fill-fuchsia-500 fill-orange-500
      fill-violet-500 fill-slate-500 fill-blue-500
    `;

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          'relative h-10 w-10 rounded-full transition-colors duration-200 flex items-center justify-center',
          className
        )}
        {...props}
      >
        <div className="hidden">{hiddenColorClasses}</div>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {paths.map((path, i) => (
             <Segment 
                key={i}
                path={path}
                isActive={intensity > i}
                color={color}
                isCustomColor={isCustomColor}
             />
          ))}
        </svg>

        {intensity === 4 && (
          <Check 
            className={cn("absolute h-5 w-5 transition-opacity duration-300", foregroundColorClass)}
            style={foregroundColorStyle}
          />
        )}
      </button>
    );
  }
);

LevelledCheckinButton.displayName = 'LevelledCheckinButton';
