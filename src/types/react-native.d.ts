import 'react-native';

declare module 'react-native' {
  interface ViewProps {
    style?: any;
    children?: React.ReactNode;
    [key: string]: any;
  }

  interface TextProps {
    style?: any;
    children?: React.ReactNode;
    [key: string]: any;
  }

  interface TouchableOpacityProps {
    style?: any;
    children?: React.ReactNode;
    onPress?: () => void;
    [key: string]: any;
  }
} 