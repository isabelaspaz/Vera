import { useEffect, useRef, useState } from 'react';
import { Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { analyzeLabel, demoLabels, type LabelImage } from '@vera/shared';
import { Body, Button, ErrorNotice, Screen } from '../src/components/ui';
import { useStore } from '../src/hooks/store';
import { api } from '../src/services/api';
export default function Scanner() {
  const store = useStore(), params = useLocalSearchParams<{ source?: string }>();
  const [image, setImage] = useState<(LabelImage & { uri: string }) | null>(null);
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const opened = useRef(false);
  useEffect(() => { if (store.mode === 'real' && !opened.current) { opened.current = true; void pick(params.source === 'gallery' ? 'gallery' : 'camera'); } }, []);
  async function pick(source: 'camera' | 'gallery') {
    setError(''); setBusy(true);
    try {
      if (source === 'camera') { const permission = await ImagePicker.requestCameraPermissionsAsync(); if (!permission.granted) throw new Error('Permita o acesso à câmera nas configurações do aparelho ou escolha uma foto.'); }
      const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], allowsEditing: false, quality: 0.85 };
      const result = source === 'camera' ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
      if (result.canceled || !result.assets[0]) return;
      const asset = result.assets[0];
      const output = await manipulateAsync(asset.uri, asset.width > 2000 ? [{ resize: { width: 2000 } }] : [], { compress: 0.85, format: SaveFormat.JPEG, base64: true });
      if (!output.base64 || output.base64.length > 5500000) throw new Error('A foto ficou muito grande. Tente novamente.');
      setImage({ uri: output.uri, data: output.base64, mimeType: 'image/jpeg' });
    } catch (e) { setError(e instanceof Error ? e.message : 'Não consegui abrir a imagem.'); } finally { setBusy(false); }
  }
  async function classify() {
    if (!image) return; setError(''); setBusy(true);
    try {
      const label = await api.extract([{ data: image.data, mimeType: image.mimeType }]);
      const analysis = await api.analyze(label); store.setAnalysis(analysis); router.replace('/result');
    } catch (e) { setError(e instanceof Error ? e.message : 'Não consegui classificar. Tente novamente.'); } finally { setBusy(false); }
  }
  return <Screen mode={store.mode} title={store.mode === 'demo' ? 'Escolha um exemplo.' : 'Mostre os ingredientes.'}>
    {store.mode === 'demo' ? <><Body muted>Veja como a Vera explica cada classificação.</Body>
      {demoLabels.map((label, i) => <Button key={i} title={label.productName ?? 'Exemplo'} secondary onPress={() => { store.setAnalysis(analyzeLabel(label)); router.replace('/result'); }} />)}
    </> : <><Body muted>Inclua a lista inteira de ingredientes, com o texto em foco.</Body>
      {image && <Image source={{ uri: image.uri }} style={{ width: '100%', height: 240, borderRadius: 20 }} resizeMode="contain" accessibilityLabel="Foto do rótulo escolhida" />}
      {image && <Button title={busy ? 'Classificando o alimento…' : 'Classificar alimento'} busy={busy} onPress={() => void classify()} />}
      <Button title={image ? 'Tirar outra foto' : 'Abrir câmera'} secondary={!!image} disabled={busy} onPress={() => void pick('camera')} />
      <Button title="Escolher foto" secondary disabled={busy} onPress={() => void pick('gallery')} />
      <Body muted>A foto é enviada à IA apenas ao tocar em Classificar alimento.</Body>
    </>}{error && <ErrorNotice message={error} />}
  </Screen>;
}
