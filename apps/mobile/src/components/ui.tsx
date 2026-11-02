import { useState, type ReactNode } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { theme as t } from '../theme/tokens';
export function Body({ children, muted = false }: { children: ReactNode; muted?: boolean }) { return <Text style={[s.body, muted && s.muted]}>{children}</Text>; }
export function Heading({ children }: { children: ReactNode }) { return <Text accessibilityRole="header" style={s.heading}>{children}</Text>; }
export function Eyebrow({ children }: { children: ReactNode }) { return <Text style={s.eyebrow}>{children}</Text>; }
export function Card({ children, tone = 'white' }: { children: ReactNode; tone?: 'white' | 'pale' | 'warningBg' }) { return <View style={[s.card, { backgroundColor: t.colors[tone] }]}>{children}</View>; }
export function Button({ title, onPress, secondary = false, disabled = false, busy = false, hint }: { title: string; onPress: () => void; secondary?: boolean; disabled?: boolean; busy?: boolean; hint?: string }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={title} accessibilityHint={hint} accessibilityState={{ disabled: disabled || busy, busy }} disabled={disabled || busy} onPress={onPress}
    style={({ pressed }) => [s.button, secondary && s.secondary, pressed && { opacity: t.states.pressed }, (disabled || busy) && { opacity: t.states.disabled }]}>
    {busy && <ActivityIndicator color={secondary ? t.colors.green : t.colors.white} />}<Text style={[s.buttonText, secondary && { color: t.colors.green }]}>{title}</Text>
  </Pressable>;
}
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  const [focus, setFocus] = useState(false);
  return <View style={{ gap: 8 }}><Text style={s.label}>{label}</Text><TextInput {...props} accessibilityLabel={label} placeholderTextColor={t.colors.muted} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
    style={[s.input, props.multiline && { minHeight: 100, textAlignVertical: 'top' }, focus && { borderColor: t.colors.green, borderWidth: 2 }, props.style]} /></View>;
}
export function ErrorNotice({ message }: { message: string }) { return <View accessibilityRole="alert" accessibilityLiveRegion="assertive" style={s.error}><Text style={{ color: t.colors.error, fontSize: 16 }}>{message}</Text></View>; }
export function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: selected }} accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [s.chip, selected && { backgroundColor: t.colors.green, borderColor: t.colors.green }, pressed && { opacity: 0.7 }]}><Text style={{ fontSize: 16, color: selected ? t.colors.white : t.colors.ink }}>{selected ? '✓  ' : '+  '}{label}</Text></Pressable>;
}
export function Screen({ children, title, mode, back = true }: { children: ReactNode; title?: string; mode?: string; back?: boolean }) {
  return <SafeAreaView style={s.safe}><KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.page}>
    <View style={s.top}>{back ? <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={() => router.canGoBack() ? router.back() : router.replace('/')} style={s.back}><Text style={{ color: t.colors.green, fontSize: 24 }}>←</Text></Pressable> : <Text style={s.logo}>vera.</Text>}
      <Text style={s.mode}>{mode === 'demo' ? 'DEMO · DADOS FICTÍCIOS' : 'MODO REAL'}</Text></View>
    {title && <Heading>{title}</Heading>}{children}
    <View style={{ height: 20 }} />
  </ScrollView></KeyboardAvoidingView></SafeAreaView>;
}
export const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: t.colors.cream }, page: { padding: 24, paddingBottom: 36, gap: 20, width: '100%', maxWidth: 620, alignSelf: 'center', flexGrow: 1 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12, flexWrap: 'wrap' },
  logo: { fontSize: 40, color: t.colors.green, fontWeight: '700', letterSpacing: -2 }, mode: { fontSize: 14, fontWeight: '700', letterSpacing: 1, color: t.colors.muted },
  body: { fontSize: t.type.body, color: t.colors.ink, lineHeight: 26 }, muted: { color: t.colors.muted },
  heading: { fontSize: t.type.heading, color: t.colors.ink, fontWeight: '600', letterSpacing: -0.7, lineHeight: 38 },
  eyebrow: { fontSize: 13, fontWeight: '700', letterSpacing: 1.8, color: t.colors.green },
  card: { padding: 24, borderRadius: t.radius.card, gap: 14, borderWidth: 1, borderColor: t.colors.line },
  button: { minHeight: 58, padding: 16, paddingHorizontal: 22, backgroundColor: t.colors.green, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 12 },
  secondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: t.colors.green }, buttonText: { color: t.colors.white, fontSize: 17, fontWeight: '600', textAlign: 'center' },
  label: { fontSize: 16, fontWeight: '600', color: t.colors.ink }, input: { borderWidth: 1, borderColor: t.colors.line, borderRadius: 14, backgroundColor: t.colors.white, padding: 15, fontSize: 17, color: t.colors.ink, minHeight: 54 },
  error: { padding: 16, backgroundColor: '#F8EAE6', borderRadius: 14 }, chip: { minHeight: 48, borderWidth: 1, borderColor: t.colors.line, padding: 13, borderRadius: 24, backgroundColor: t.colors.white, justifyContent: 'center' },
  back: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: t.colors.pale, borderRadius: 24 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, divider: { height: 1, backgroundColor: t.colors.line, marginVertical: 8 },
});
