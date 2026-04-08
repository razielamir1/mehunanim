import { clsx, ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export const cn = (...a: ClassValue[]) => twMerge(clsx(a));
