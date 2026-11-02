import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StoreProvider } from '../src/hooks/store';
import { theme } from '../src/theme/tokens';
export default function Layout() { return <SafeAreaProvider><StoreProvider><StatusBar style="dark" /><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.cream } }} /></StoreProvider></SafeAreaProvider>; }
