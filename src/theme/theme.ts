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
    primary: colors.deepFocusBlue,
    secondary: colors.agilityBlue,
    success: colors.successGreen,
    background: colors.clarityWhite,
    surface: colors.lightGray,
    text: colors.deepFocusBlue,
    placeholder: colors.subtleGray,
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.agilityBlue,
    secondary: colors.deepFocusBlue,
    success: colors.successGreen,
    background: colors.deepFocusBlue,
    surface: '#1A2B4A',
    text: colors.clarityWhite,
    placeholder: colors.lightGray,
  },
}; 