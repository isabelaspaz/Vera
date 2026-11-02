import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Note, Screen } from '../src/components/ui';
import { useStore } from '../src/hooks/store';
import { theme as t } from '../src/theme/tokens';

export default function Home() {
  const store = useStore();
  function open(source: 'camera' | 'gallery') { store.reset(); router.push({ pathname: '/scanner', params: { source } }); }
  return <Screen back={false}>
    <View style={styles.content}>
      <View style={styles.intro}>
        <Text accessibilityRole="header" style={styles.headline}>Entenda o que{ '\n' }você come.</Text>
      </View>

      <View style={styles.actions}>
        <Button title="Fotografar rótulo" icon="camera" onPress={() => open('camera')} />
        <Button title="Escolher da galeria" variant="secondary" icon="image" onPress={() => open('gallery')} />
      </View>
    </View>
    <Note icon="shield">A foto só é enviada ao Google Gemini quando você confirma a classificação.</Note>
  </Screen>;
}
const styles = StyleSheet.create({
  content: { flexGrow: 1, justifyContent: 'center', paddingTop: 32, paddingBottom: 44, gap: 36 },
  intro: { paddingHorizontal: 4 },
  headline: { fontSize: 38, lineHeight: 48, fontWeight: '500', letterSpacing: -1.4, color: t.colors.ink },
  actions: { gap: 12 },
});
