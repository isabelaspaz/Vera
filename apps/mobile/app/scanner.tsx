import { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import type { LabelImage } from '@vera/shared';
import { Body, Button, ErrorNotice, Icon, Note, Screen } from '../src/components/ui';
import { useStore } from '../src/hooks/store';
import { theme as t } from '../src/theme/tokens';
export default function Scanner() {
  const store = useStore(), params = useLocalSearchParams<{ source?: string }>();
  const [image, setImage] = useState<(LabelImage & { uri: string }) | null>(null);
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const opened = useRef(false);
  useEffect(() => { if (!opened.current) { opened.current = true; void pick(params.source === 'gallery' ? 'gallery' : 'camera'); } }, []);
  async function pick(source: 'camera' | 'gallery') {
    setError(''); setBusy(true);
    try {
      if (source === 'camera') { const permission = await ImagePicker.requestCameraPermissionsAsync(); if (!permission.granted) throw new Error('Permita o acesso à câmera nas configurações do aparelho ou escolha uma foto.'); }
      const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], allowsEditing: false, quality: 0.85 };
      const result = source === 'camera' ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
      if (result.canceled || !result.assets[0]) return;
      const asset = result.assets[0];
      const resize = Math.max(asset.width, asset.height) > 2000
        ? [{ resize: asset.width >= asset.height ? { width: 2000 } : { height: 2000 } }]
        : [];
      const output = await manipulateAsync(asset.uri, resize, { compress: 0.85, format: SaveFormat.JPEG, base64: true });
      if (!output.base64 || output.base64.length > 5500000) throw new Error('A foto ficou muito grande. Tente novamente.');
      setImage({ uri: output.uri, data: output.base64, mimeType: 'image/jpeg' });
    } catch (e) { setError(e instanceof Error ? e.message : 'Não consegui abrir a imagem.'); } finally { setBusy(false); }
  }
  function classify() {
    if (!image || busy) return;
    store.setAnalysis(null);
    store.setPendingImage({ data: image.data, mimeType: image.mimeType });
    router.replace('/analyzing');
  }
  return <Screen title="Fotografe os ingredientes.">
      <Body muted>Fotografe a lista inteira de ingredientes. Boa luz e texto nítido fazem a diferença.</Body>
      <View style={styles.preview}>
        {image ? <Image source={{ uri: image.uri }} style={styles.previewImage} resizeMode="contain" accessibilityLabel="Foto do rótulo escolhida" />
          : <View style={styles.emptyPreview}><View style={styles.cameraIcon}><Icon name="camera" size={36} color={t.colors.green} /></View><Text style={styles.previewTitle}>Ingredientes em foco.</Text><Text style={styles.previewDescription}>A lista inteira, em uma foto.</Text></View>}
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" pointerEvents="none" style={styles.frameTopLeft} />
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" pointerEvents="none" style={styles.frameBottomRight} />
      </View>
      <View style={styles.captureTip}><Icon name="sun" color={t.colors.warning} size={20} /><Text style={styles.captureTipText}>Evite reflexos e mantenha a câmera firme.</Text></View>
      {image && <Button title="Classificar alimento" icon="search" busy={busy} onPress={classify} />}
      <Button title={image ? 'Tirar outra foto' : 'Abrir câmera'} icon="camera" variant={image ? 'secondary' : 'primary'} disabled={busy} onPress={() => void pick('camera')} />
      <Button title="Escolher da galeria" icon="image" variant="ghost" disabled={busy} onPress={() => void pick('gallery')} />
      <Note icon="shield">A foto é enviada ao Google Gemini apenas ao tocar em Classificar alimento.</Note>
    {error && <ErrorNotice message={error} />}
  </Screen>;
}
const styles = StyleSheet.create({
  preview: { backgroundColor: t.colors.white, padding: 20, minHeight: 280, borderRadius: 32, overflow: 'hidden', ...t.shadow },
  previewImage: { width: '100%', height: 260, borderRadius: 20 },
  emptyPreview: { flex: 1, minHeight: 240, alignItems: 'center', justifyContent: 'center', gap: 13, padding: 18 },
  cameraIcon: { width: 88, height: 88, borderRadius: 32, backgroundColor: t.colors.lavender, alignItems: 'center', justifyContent: 'center', marginBottom: 7 },
  previewTitle: { fontSize: 20, fontWeight: '500', lineHeight: 28, color: t.colors.ink, textAlign: 'center' },
  previewDescription: { fontSize: 15, lineHeight: 23, color: t.colors.muted, textAlign: 'center' },
  frameTopLeft: { position: 'absolute', top: 18, left: 18, width: 32, height: 32, borderTopWidth: 2, borderLeftWidth: 2, borderTopLeftRadius: 12, borderColor: t.colors.green },
  frameBottomRight: { position: 'absolute', bottom: 18, right: 18, width: 32, height: 32, borderBottomWidth: 2, borderRightWidth: 2, borderBottomRightRadius: 12, borderColor: t.colors.green },
  captureTip: { backgroundColor: t.colors.butter, padding: 16, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 10 },
  captureTipText: { flex: 1, fontSize: 14, lineHeight: 22, color: t.colors.warning },
});
