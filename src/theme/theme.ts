import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const colors = {
  deepFocusBlue: '#0A2342',
  agilityBlue: '#007BFF',
  successGreen: '#28A745',
  clarityWhite: '#FFFFFF',
  lightGray: '#F8F9FA',
  subtleGray: '#6C757D',
};

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#0A2342',
    secondary: '#007BFF',
    background: '#FFFFFF',
    surface: '#F8F9FA',
    error: '#DC3545',
    onSurface: '#000000',
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#007BFF',
    secondary: '#0A2342',
    background: '#121212',
    surface: '#1E1E1E',
    error: '#DC3545',
    onSurface: '#FFFFFF',
  },
}; 