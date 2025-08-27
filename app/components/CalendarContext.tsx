import { createContext } from 'react';
import { CalendarDay } from '../types';

export const CalendarContext = createContext<CalendarDay[]>([]);