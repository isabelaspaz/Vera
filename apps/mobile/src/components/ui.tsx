import { useState, type ComponentProps, type ReactNode } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import { theme as t } from '../theme/tokens';

export type IconName = ComponentProps<typeof Feather>['name'];
export type PastelTone = 'white' | 'pale' | 'lavender' | 'butter' | 'peach' | 'warningBg';
export function Icon({ name, size = 22, color = t.colors.ink }: { name: IconName; size?: number; color?: string }) {
  return <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" pointerEvents="none"><Feather name={name} size={size} color={color} /></View>;
}
export function Body({ children, muted = false }: { children: ReactNode; muted?: boolean }) {
  return <Text style={[s.body, muted && s.muted]}>{children}</Text>;
}
export function Heading({ children }: { children: ReactNode }) {
  return <Text accessibilityRole="header" style={s.heading}>{children}</Text>;
}
export function Eyebrow({ children }: { children: ReactNode }) { return <Text style={s.eyebrow}>{children}</Text>; }
export function Card({ children, tone = 'white' }: { children: ReactNode; tone?: PastelTone }) {
  return <View style={[s.card, { backgroundColor: t.colors[tone] }]}>{children}</View>;
}
export function Button({ title, onPress, variant = 'primary', disabled = false, busy = false, hint, icon }: {
  title: string; onPress: () => void; variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean; busy?: boolean; hint?: string; icon?: IconName;
}) {
  const foreground = variant === 'primary' ? t.colors.white : t.colors.green;
  const [focused, setFocused] = useState(false);
  return <Pressable accessibilityRole="button" accessibilityLabel={title} accessibilityHint={hint}
    accessibilityState={{ disabled: disabled || busy, busy }} disabled={disabled || busy} onPress={onPress}
    onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
    style={({ pressed }) => [s.button, variant === 'secondary' && s.secondary, variant === 'ghost' && s.ghost,
      focused && s.focus, pressed && { opacity: t.states.pressed }, (disabled || busy) && { opacity: t.states.disabled }]}>
    {busy ? <ActivityIndicator color={foreground} /> : icon ? <Icon name={icon} color={foreground} /> : null}
    <Text style={[s.buttonText, { color: foreground }]}>{title}</Text>
    {variant === 'primary' && !busy && <Icon name="arrow-right" color={foreground} size={20} />}
  </Pressable>;
}
export function ErrorNotice({ message }: { message: string }) {
  return <View accessibilityRole="alert" accessibilityLiveRegion="assertive" style={s.error}>
    <Icon name="alert-circle" color={t.colors.error} /><Text style={s.errorText}>{message}</Text>
  </View>;
}
export function Note({ children, icon = 'info' }: { children: ReactNode; icon?: IconName }) {
  return <View style={s.note}><Icon name={icon} size={17} color={t.colors.muted} /><Text style={s.noteText}>{children}</Text></View>;
}
export function Screen({ children, title, back = true }: { children: ReactNode; title?: string; back?: boolean }) {
  const [backFocused, setBackFocused] = useState(false);
  return <SafeAreaView style={s.safe}><KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.page} showsVerticalScrollIndicator={false}>
      <View style={s.top}>
        {back ? <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={() => router.canGoBack() ? router.back() : router.replace('/')}
          onFocus={() => setBackFocused(true)} onBlur={() => setBackFocused(false)}
          style={({ pressed }) => [s.back, backFocused && s.focus, pressed && { opacity: t.states.pressed }]}><Icon name="arrow-left" /></Pressable>
          : <Text accessibilityLabel="Vera" style={s.logo}>vera<Text style={{ color: t.colors.green }}>.</Text></Text>}
        {back && <Text accessibilityLabel="Vera" style={s.smallLogo}>vera.</Text>}
        <View style={s.modePill}>
          <Icon name="cpu" size={13} color={t.colors.green} />
          <Text accessibilityLabel="Classificação com inteligência artificial" style={s.mode}>COM IA</Text>
        </View>
      </View>
      {title && <Heading>{title}</Heading>}{children}
    </ScrollView>
  </KeyboardAvoidingView></SafeAreaView>;
}
export const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: t.colors.cream },
  page: { paddingHorizontal: 22, paddingTop: 8, paddingBottom: 36, gap: 20, width: '100%', maxWidth: 560, alignSelf: 'center', flexGrow: 1 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 4, flexWrap: 'wrap' },
  logo: { fontSize: 44, color: t.colors.ink, fontWeight: '600', letterSpacing: -2.5 },
  smallLogo: { fontSize: 28, color: t.colors.ink, fontWeight: '600', letterSpacing: -1.6 },
  modePill: { backgroundColor: t.colors.pale, paddingVertical: 9, paddingHorizontal: 13, borderRadius: t.radius.pill, flexDirection: 'row', alignItems: 'center', gap: 7, minHeight: 36 },
  mode: { fontSize: 12, fontWeight: '700', letterSpacing: 1.3, color: t.colors.ink },
  body: { fontSize: t.type.body, color: t.colors.ink, lineHeight: 26 }, muted: { color: t.colors.muted },
  heading: { fontSize: t.type.heading, color: t.colors.ink, fontWeight: '500', letterSpacing: -1, lineHeight: 40 },
  eyebrow: { fontSize: 12, lineHeight: 18, fontWeight: '600', letterSpacing: 1.6, color: t.colors.green },
  card: { padding: 24, borderRadius: t.radius.card, gap: 14, ...t.shadow },
  button: { minHeight: 60, paddingVertical: 17, paddingHorizontal: 22, backgroundColor: t.colors.green, borderRadius: t.radius.pill, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, borderWidth: 1, borderColor: 'transparent' },
  secondary: { backgroundColor: t.colors.white, borderColor: t.colors.line }, ghost: { backgroundColor: 'transparent', paddingVertical: 12, minHeight: 48 },
  buttonText: { fontSize: 16, lineHeight: 23, fontWeight: '600', flexShrink: 1, textAlign: 'center' },
  focus: { borderWidth: 2, borderColor: t.colors.ink },
  error: { padding: 18, backgroundColor: '#F8EAE6', borderRadius: 20, gap: 12, flexDirection: 'row', alignItems: 'flex-start' },
  errorText: { flex: 1, color: t.colors.error, fontSize: 16, lineHeight: 24 },
  back: { width: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: t.colors.white, borderRadius: 24, borderWidth: 1, borderColor: t.colors.line },
  note: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', paddingHorizontal: 6 },
  noteText: { fontSize: 14, lineHeight: 21, color: t.colors.muted, flex: 1 },
});
