import { createContext } from 'react';
import { Card } from '../types';

export interface ClickPosition {
  x: number;
  y: number;
}

export const CardViewerContext = createContext<(c: Card, position?: ClickPosition) => void>(() => {});