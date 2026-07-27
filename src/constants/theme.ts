export type ThemeMode = 'light' | 'dark';

export interface AppTheme {
  mode: ThemeMode;
  dark: boolean;
  colors: {
    background: string;
    surface: string;
    ink: string;
    muted: string;
    primary: string;
    primarySoft: string;
    accent: string;
    accentSoft: string;
    border: string;
    danger: string;
    dangerSoft: string;
    white: string;
    shadow: string;
    overlay: string;
  };
  radius: { sm: number; md: number; lg: number; pill: number };
}

const radius = { sm: 10, md: 16, lg: 24, pill: 999 };

export const themes: Record<ThemeMode, AppTheme> = {
  light: {
    mode: 'light',
    dark: false,
    colors: {
      background: '#F5F2EC',
      surface: '#FFFFFF',
      ink: '#1D2B24',
      muted: '#6D776F',
      primary: '#1E6B4E',
      primarySoft: '#DDEDE5',
      accent: '#ED7D4A',
      accentSoft: '#FBE4D8',
      border: '#E1DED7',
      danger: '#B9473B',
      dangerSoft: '#F9E6E3',
      white: '#FFFFFF',
      shadow: '#17271F',
      overlay: 'rgba(18,31,25,.45)'
    },
    radius
  },
  dark: {
    mode: 'dark',
    dark: true,
    colors: {
      background: '#101713',
      surface: '#19231E',
      ink: '#F1F5F2',
      muted: '#A6B1AA',
      primary: '#67C49B',
      primarySoft: '#203D31',
      accent: '#F28A58',
      accentSoft: '#4B2D20',
      border: '#304039',
      danger: '#FF8B7E',
      dangerSoft: '#412824',
      white: '#FFFFFF',
      shadow: '#000000',
      overlay: 'rgba(2,7,4,.68)'
    },
    radius
  }
};
