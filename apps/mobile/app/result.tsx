import { Text } from 'react-native';
import { router } from 'expo-router';
import { novaNames } from '@vera/shared';
import { Body, Button, Card, Eyebrow, Screen } from '../src/components/ui';
import { useStore } from '../src/hooks/store';
import { theme as t } from '../src/theme/tokens';
export default function Result() {
  const store = useStore(), result = store.analysis;
  if (!result) return <Screen mode={store.mode} title="Vamos olhar um alimento?"><Button title="Voltar ao início" onPress={() => router.replace('/')} /></Screen>;
  const nova = result.novaAssessment;
  return <Screen mode={store.mode} title={result.label.productName ?? 'Seu alimento'}>
    <Card tone="pale"><Eyebrow>{nova.group === 'indeterminate' ? 'PRECISO DE MAIS INFORMAÇÕES' : `NOVA ${nova.group} · CLASSIFICAÇÃO ESTIMADA`}</Eyebrow>
      <Text accessibilityRole="header" style={{ fontSize: 30, color: t.colors.green, fontWeight: '600' }}>{novaNames[nova.group]}</Text><Body>{nova.summary}</Body>
      {nova.group === 'indeterminate' && <Body muted>Uma foto mais nítida da lista completa pode ajudar.</Body>}
    </Card>
    <Button title="Analisar outro alimento" onPress={() => { store.reset(); router.replace('/'); }} />
    <Body muted>A classificação considera o processamento do alimento a partir das informações lidas.</Body>
  </Screen>;
}
