import { createContext } from 'react';
import { Card } from '../types';

export const CardViewerContext = createContext<(c: Card) => void>((c: Card) => {});