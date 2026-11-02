import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import type { AnalysisPhase } from '@vera/shared';
import { Button, ErrorNotice, Screen } from '../src/components/ui';
import { useStore } from '../src/hooks/store';
import { api } from '../src/services/api';
import { theme as t } from '../src/theme/tokens';

export default function Analyzing() {
  const store = useStore();
  const [phase, setPhase] = useState<AnalysisPhase>('reading');
  const [error, setError] = useState('');
  const request = useRef<ReturnType<typeof api.classify> | null>(null);
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    let active = true;
    if (!store.pendingImage) {
      router.replace('/');
      return () => { mounted.current = false; };
    }
    // Reuse this promise when development mode repeats the effect.
    request.current ??= api.classify(store.pendingImage, next => {
      if (mounted.current) setPhase(next);
    });
    void request.current.then(analysis => {
      if (!active) return;
      store.setAnalysis(analysis);
      store.setPendingImage(null);
      router.replace('/result');
    }).catch(e => {
      if (active) setError(e instanceof Error ? e.message : 'Não consegui classificar. Tente novamente.');
    });
    return () => { active = false; mounted.current = false; };
  }, []);

  function chooseAnother() { store.reset(); router.replace('/'); }
  return <Screen back={false}>
    <View style={styles.content}>
      {error ? <>
        <Text accessibilityRole="header" style={styles.title}>Não foi possível concluir.</Text>
        <ErrorNotice message={error} />
        <Button title="Escolher outra foto" icon="image" onPress={chooseAnother} />
      </> : <>
        <ActivityIndicator size="large" color={t.colors.green} />
        <Text accessibilityRole="header" accessibilityLiveRegion="polite" style={styles.title}>
          {phase === 'reading' ? 'Lendo o rótulo…' : 'Classificando o alimento…'}
        </Text>
        <Text style={styles.description}>Mantenha o aplicativo aberto</Text>
      </>}
    </View>
  </Screen>;
}
const styles = StyleSheet.create({
  content: { flexGrow: 1, justifyContent: 'center', gap: 24, paddingVertical: 40 },
  title: { fontSize: 28, lineHeight: 36, fontWeight: '500', color: t.colors.ink, textAlign: 'center' },
  description: { fontSize: 16, lineHeight: 24, color: t.colors.muted, textAlign: 'center' },
});
