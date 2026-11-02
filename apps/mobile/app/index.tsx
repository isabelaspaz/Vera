import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { Body, Button, Eyebrow, Screen } from '../src/components/ui';
import { useStore } from '../src/hooks/store';
import { theme as t } from '../src/theme/tokens';
export default function Home() {
  const store = useStore();
  return <Screen mode={store.mode} back={false}>
    <View style={{ paddingVertical: 24, gap: 24 }}>
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ backgroundColor: t.colors.pale, borderRadius: 36, width: 78, height: 78, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: t.colors.green, fontSize: 52 }}>◎</Text></View>
      <Eyebrow>ENTENDA O QUE VOCÊ COME.</Eyebrow>
      <Text accessibilityRole="header" style={{ fontSize: 38, lineHeight: 46, fontWeight: '600', letterSpacing: -1.3, color: t.colors.ink }}>Que tipo de{ '\n' }alimento é esse?</Text>
      <Body muted>Fotografe os ingredientes. A Vera identifica o grau de processamento e explica o porquê.</Body>
    </View>
    <Button title={store.mode === 'demo' ? 'Experimentar um exemplo' : 'Fotografar rótulo'} onPress={() => { store.reset(); router.push({ pathname: '/scanner', params: { source: 'camera' } }); }} />
    {store.mode === 'real' && <Button title="Escolher foto" secondary onPress={() => { store.reset(); router.push({ pathname: '/scanner', params: { source: 'gallery' } }); }} />}
    <Body muted>{store.mode === 'demo' ? 'Demonstração com alimentos fictícios.' : 'A foto será enviada ao Google Gemini para classificação.'}</Body>
    <Button title={store.mode === 'demo' ? 'Usar IA com uma foto real' : 'Ver exemplos de demonstração'} secondary onPress={() => store.setMode(store.mode === 'demo' ? 'real' : 'demo')} />
  </Screen>;
}
