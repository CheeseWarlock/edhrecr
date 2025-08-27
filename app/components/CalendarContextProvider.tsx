'use client';

import { CalendarContext } from "./CalendarContext";
import { CalendarDay } from "../types";

export function CalendarContextProvider({ calendarDays, children }: { calendarDays: CalendarDay[], children: React.ReactNode }) {
  return <CalendarContext value={calendarDays}>{children}</CalendarContext>;
}