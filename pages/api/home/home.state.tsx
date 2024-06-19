// /pages/api/home/home.state.tsx
export interface HomeInitialState {
  apiKey: string;
  guestCode: string;
  loading: boolean;
  lightMode: 'light' | 'dark';
}

export const initialState: HomeInitialState = {
  apiKey: '',
  guestCode: '',
  loading: false,
  lightMode: 'dark',
};
