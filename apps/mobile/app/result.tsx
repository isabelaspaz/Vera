import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { novaNames } from '@vera/shared';
import { Button, Card, Eyebrow, Icon, Note, Screen } from '../src/components/ui';
import { useStore } from '../src/hooks/store';
import { theme as t } from '../src/theme/tokens';

export default function Result() {
  const store = useStore(), result = store.analysis;
  if (!result) return <Screen title="Vamos olhar um alimento?"><Button title="Voltar ao início" onPress={() => router.replace('/')} /></Screen>;
  const nova = result.novaAssessment, uncertain = nova.group === 'indeterminate';
  const tone = t.classification[nova.group];
  return <Screen title="Resultado">
    <View style={styles.intro}><Text accessibilityRole="header" style={styles.product}>{result.label.productName ?? 'Seu alimento'}</Text></View>
    <View style={[styles.assessment, { backgroundColor: tone.background }]}>
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.groupEmblem}>
        <View style={styles.emblemRing}><View style={styles.emblemCenter}>{uncertain ? <Icon name="search" size={40} color={tone.accent} /> : <Text allowFontScaling={false} style={[styles.groupNumber, { color: tone.accent }]}>{nova.group}</Text>}</View></View>
      </View>
      <View style={styles.groupHeading}>
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[styles.marker, { backgroundColor: tone.accent }]} />
        <Text style={[styles.groupLabel, { color: tone.accent }]}>{uncertain ? 'INFORMAÇÃO INSUFICIENTE' : `GRUPO NOVA ${nova.group}`}</Text>
      </View>
      <Text accessibilityRole="header" style={styles.classification}>{nova.group === '2' ? 'Ingrediente culinário' : novaNames[nova.group]}</Text>
      {nova.group === '2' && <Text style={styles.groupDescription}>Usado para cozinhar ou temperar, como óleo, sal e açúcar.</Text>}
      <View style={styles.estimatePill}><Icon name={uncertain ? 'eye' : 'info'} size={14} color={t.colors.muted} /><Text style={styles.estimate}>{uncertain ? 'Uma foto mais nítida pode ajudar' : 'Estimativa a partir do rótulo'}</Text></View>
    </View>
    <Card><View style={styles.explanationTitle}><Icon name="feather" size={18} color={t.colors.green} /><Eyebrow>{uncertain ? 'O QUE FALTOU?' : 'EM POUCAS PALAVRAS'}</Eyebrow></View><Text style={styles.explanation}>{nova.summary}</Text></Card>
    <Button title={uncertain ? 'Tentar outra foto' : 'Analisar outro alimento'} icon="camera" onPress={() => { store.reset(); router.replace('/'); }} />
    <Note>{uncertain ? 'Inclua a lista inteira de ingredientes, com boa iluminação e o texto em foco.' : 'Estimativa do grau de processamento com base nas informações lidas.'}</Note>
  </Screen>;
}
const styles = StyleSheet.create({
  intro: { gap: 10, paddingHorizontal: 3 }, product: { color: t.colors.ink, fontSize: 29, lineHeight: 37, letterSpacing: -0.8, fontWeight: '500' },
  assessment: { padding: 26, borderRadius: 36, alignItems: 'center', gap: 14, ...t.shadow },
  groupEmblem: { width: 128, height: 128, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  emblemRing: { width: 122, height: 122, borderRadius: 61, borderWidth: 1, borderColor: '#FFFFFF', padding: 10 },
  emblemCenter: { flex: 1, backgroundColor: '#FFFFFFB8', borderRadius: 55, alignItems: 'center', justifyContent: 'center' },
  groupNumber: { color: t.colors.ink, fontSize: 64, fontWeight: '400', letterSpacing: -4, paddingRight: 4 },
  groupHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, maxWidth: '100%' },
  marker: { width: 8, height: 8, borderRadius: 4 },
  groupDescription: { fontSize: 16, lineHeight: 24, color: t.colors.ink, textAlign: 'center' },
  groupLabel: { fontSize: 13, lineHeight: 20, letterSpacing: 2, fontWeight: '600', flexShrink: 1, textAlign: 'center' },
  classification: { fontSize: 29, lineHeight: 37, color: t.colors.ink, fontWeight: '500', letterSpacing: -0.7, textAlign: 'center' },
  estimatePill: { flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' },
  estimate: { fontSize: 14, lineHeight: 21, color: t.colors.muted, textAlign: 'center' },
  explanationTitle: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  explanation: { fontSize: 17, lineHeight: 27, color: t.colors.ink },
});
