import { FileTag } from '../types';
import { nanoid } from '@reduxjs/toolkit';

export const TAG_COLORS = [
  'blue',
  'red',
  'green',
  'yellow',
  'purple',
  'pink',
  'indigo',
  'teal',
  'orange',
  'gray',
];

export function getRandomTagColor(): string {
  return TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];
}

export function createNewTag(name: string, color?: string): FileTag {
  return {
    id: nanoid(),
    name: name.trim(),
    color: color || getRandomTagColor(),
  };
}

export function getTagColorClass(color: string): { bg: string; text: string } {
  const colorMap: Record<string, { bg: string; text: string }> = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-700' },
    red: { bg: 'bg-red-50', text: 'text-red-700' },
    green: { bg: 'bg-green-50', text: 'text-green-700' },
    yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-700' },
    pink: { bg: 'bg-pink-50', text: 'text-pink-700' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700' },
    teal: { bg: 'bg-teal-50', text: 'text-teal-700' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-700' },
    gray: { bg: 'bg-gray-100', text: 'text-gray-700' },
  };

  return colorMap[color] || colorMap.gray;
}
