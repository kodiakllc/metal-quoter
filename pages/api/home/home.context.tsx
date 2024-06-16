// pages/api/home/home.context.tsx
import { Dispatch, createContext } from 'react';

import { ActionType } from '@/hooks/useCreateReducer';

import { HomeInitialState } from './home.state';

export interface HomeContextProps {
  state: HomeInitialState;
  dispatch: Dispatch<ActionType<HomeInitialState>>;
}

const HomeContext = createContext<HomeContextProps>(undefined!);

export default HomeContext;
