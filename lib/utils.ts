
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatSlotTime(startTime: number, duration: number, timeFormat: '12h' | '24h' = '12h'): string {
    const startHour = Math.floor(startTime / 6);
    const startMinute = (startTime % 6) * 10;

    const endSlot = startTime + duration -1; // -1 because duration of 1 is one slot.
    let endHour = Math.floor(endSlot / 6);
    let endMinute = (endSlot % 6) * 10;
    
    // Adjust for crossing midnight
    if (endHour >= 24) {
      endHour = endHour % 24;
    }
    
    const formatTime = (hour: number, minute: number) => {
        if (timeFormat === '24h') {
          const h = hour.toString().padStart(2, '0');
          const m = minute.toString().padStart(2, '0');
          return `${h}:${m}`;
        }
        const h = hour === 0 || hour === 12 ? 12 : hour % 12;
        const m = minute.toString().padStart(2, '0');
        const ampm = hour < 12 ? 'am' : 'pm';
        return `${h}:${m}${ampm}`;
    }

    const startTimeFormatted = formatTime(startHour, startMinute);
    // End time is inclusive, so we show the end of the last 10-minute slot
    const endTimeFormatted = formatTime(endHour, endMinute + 9);

    return `${startTimeFormatted} - ${endTimeFormatted}`;
}

export function getContrastingTextColor(hex: string): '#ffffff' | '#000000' {
  if (!hex || !hex.startsWith('#')) return '#000000';
  
  const hexValue = hex.length === 4 
    ? hex.slice(1).split('').map(char => char + char).join('')
    : hex.slice(1);

  if (hexValue.length !== 6) return '#000000';

  const r = parseInt(hexValue.slice(0, 2), 16);
  const g = parseInt(hexValue.slice(2, 4), 16);
  const b = parseInt(hexValue.slice(4, 6), 16);
  
  // http://www.w3.org/TR/AERT#color-contrast
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? '#000000' : '#ffffff';
}

export function hexToRgba(hex: string, alpha: number): string {
  if (!hex.startsWith('#')) return hex;
    
  let r = 0, g = 0, b = 0;

  if (hex.length === 4) { // #RGB
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) { // #RRGGBB
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  } else {
    return hex; // Invalid hex, return as is
  }

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
