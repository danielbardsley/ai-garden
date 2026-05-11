import { CameraCapturedPicture, CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Image, Platform, Pressable, ScrollView, Text, View } from 'react-native';

import { useHomeGardenRecords } from '../../garden-records/hooks/useGardenRecords';
import { PlantRecord } from '../../garden-records/models/GardenRecordTypes';
import { gardenAgentService } from '../../garden-agent/GardenAgentService';
import { GardenAgentDiagnostics } from '../../garden-agent/GardenAgentDiagnostics';
import { GardenAgentPhotoIdentificationOutput } from '../../garden-agent/types';
import { cameraCaptureService } from '../../garden-records/services/CameraCaptureService';
import { plantSwatch } from '../../garden-records/viewModels';
import { GlyphIcon, IconButton, PhotoTreatment, SerifText } from '../components/primitives';
import { theme } from '../theme';

type Phase = 'viewfinder' | 'analyzing' | 'identified' | 'analysisFailed' | 'saving';

type AnalysisResult = { runId: string; output: GardenAgentPhotoIdentificationOutput };

const MIN_AUTO_SUGGEST_CONFIDENCE = 0.55;

export function CameraScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const initialPlantId = Array.isArray(params.plantId) ? params.plantId[0] : params.plantId;
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const { data } = useHomeGardenRecords();
  const [phase, setPhase] = useState<Phase>('viewfinder');
  const [captured, setCaptured] = useState<CameraCapturedPicture | null>(null);
  const [selectedPlantId, setSelectedPlantId] = useState(initialPlantId ?? '');
  const [addToInventory, setAddToInventory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [diagnostics, setDiagnostics] = useState<GardenAgentDiagnostics | null>(null);

  const plants = data.plants;
  const selectedPlant = plants.find((plant) => plant.id === selectedPlantId) ?? null;

  if (Platform.OS === 'web') {
    return <WebCameraFallback onClose={() => router.back()} />;
  }

  if (!permission) {
    return <CameraShell onClose={() => router.back()}><CenteredText title="Opening camera…" /></CameraShell>;
  }

  if (!permission.granted) {
    return (
      <CameraShell onClose={() => router.back()}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 26 }}>
          <GlyphIcon name="camera" color="#fff" size={34} />
          <SerifText style={{ color: '#fff', fontSize: 28, marginTop: 18, textAlign: 'center' }}>Camera permission</SerifText>
          <Text style={{ color: 'rgba(255,255,255,0.76)', textAlign: 'center', lineHeight: 21, marginTop: 10 }}>
            Garden Roof Deck needs the camera to add plant photos to your local journal.
          </Text>
          <Pressable onPress={requestPermission} style={{ marginTop: 22, borderRadius: 999, paddingVertical: 13, paddingHorizontal: 20, backgroundColor: theme.primary }}>
            <Text style={{ color: theme.bg, fontWeight: '800' }}>Allow camera</Text>
          </Pressable>
        </View>
      </CameraShell>
    );
  }

  const snap = async () => {
    if (!cameraRef.current || phase !== 'viewfinder') return;
    try {
      setError(null);
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.86, skipProcessing: false });
      setCaptured(photo);
      setAnalysis(null);
      setDiagnostics(null);
      setPhase('analyzing');
      const result = await gardenAgentService.identifyCapturedPhoto({
        localUri: photo.uri,
        width: photo.width,
        height: photo.height,
        mimeType: 'image/jpeg',
        launchedFromPlantId: initialPlantId,
        plants,
      });
      if (!result || 'diagnostics' in result || !result.output) {
        setDiagnostics(result && 'diagnostics' in result ? result.diagnostics : null);
        setSelectedPlantId('');
        setAddToInventory(false);
        setPhase('analysisFailed');
        return;
      }
      const topMatch = result.output.plantMatches?.[0];
      if (topMatch?.plantId && topMatch.confidence >= MIN_AUTO_SUGGEST_CONFIDENCE) {
        setSelectedPlantId(topMatch.plantId);
        setAddToInventory(false);
      } else {
        setSelectedPlantId('');
        setAddToInventory(Boolean(result.output.openIdentification));
      }
      setAnalysis(result);
      setDiagnostics(null);
      setPhase('identified');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not capture photo.');
    }
  };

  const save = async () => {
    if (!captured || (!selectedPlant && !addToInventory)) return;
    try {
      setError(null);
      setPhase('saving');
      const suggestedPlantId = analysis?.output.plantMatches?.[0]?.plantId ?? null;
      const result = await cameraCaptureService.saveCapturedPhoto({
        plantId: selectedPlant?.id,
        addNewPlant: addToInventory,
        localUri: captured.uri,
        width: captured.width,
        height: captured.height,
        mimeType: 'image/jpeg',
        aiAnalysis: analysis,
        suggestedPlantId,
        matchSource: addToInventory ? 'ai_confirmed' : analysis && selectedPlant ? (suggestedPlantId === selectedPlant.id ? 'ai_confirmed' : 'ai_corrected') : 'manual_fallback',
      });
      router.replace(`/plants/${result.photo.plantId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save photo.');
      setPhase('identified');
    }
  };

  const retake = () => {
    setCaptured(null);
    setAnalysis(null);
    setDiagnostics(null);
    setAddToInventory(false);
    setPhase('viewfinder');
    setError(null);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0a0c0a' }}>
      <View style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {captured ? (
          <Image source={{ uri: captured.uri }} resizeMode="cover" style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }} />
        ) : (
          <CameraView ref={cameraRef} facing="back" style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }} />
        )}
        {phase === 'viewfinder' ? <Crosshair /> : null}
        {phase === 'analyzing' ? <ScanningOverlay /> : null}
        {(phase === 'identified' || phase === 'analysisFailed' || phase === 'saving') ? (
          <IdentifiedBubble
            plants={plants}
            selectedPlant={selectedPlant}
            selectedPlantId={selectedPlantId}
            onPlant={(id) => { setSelectedPlantId(id); setAddToInventory(false); }}
            addToInventory={addToInventory}
            onAddToInventory={() => { setSelectedPlantId(''); setAddToInventory(true); }}
            onSave={save}
            onRetry={retake}
            saving={phase === 'saving'}
            analysis={analysis}
            analysisFailed={phase === 'analysisFailed'}
            diagnostics={diagnostics}
          />
        ) : null}

        <View style={{ position: 'absolute', top: 54, left: 16, zIndex: 10 }}>
          <IconButton label="Close camera" onPress={() => router.back()} dark theme={theme}><GlyphIcon name="close" color="#fff" /></IconButton>
        </View>
        <View style={{ position: 'absolute', top: 56, right: 16, zIndex: 10, borderRadius: 999, paddingVertical: 9, paddingHorizontal: 12, backgroundColor: 'rgba(255,255,255,0.18)', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <GlyphIcon name="sparkle" color="#fff" size={15} />
          <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>Garden camera</Text>
        </View>
        {error ? <Text style={{ position: 'absolute', left: 20, right: 20, top: 110, color: '#fff', backgroundColor: 'rgba(200,80,60,0.72)', borderRadius: 14, padding: 12 }}>{error}</Text> : null}
      </View>

      {phase === 'viewfinder' ? (
        <View style={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ width: 50, height: 50 }} />
          <Pressable onPress={snap} accessibilityRole="button" accessibilityLabel="Capture" style={{ width: 76, height: 76, borderRadius: 38, borderWidth: 4, borderColor: 'rgba(255,255,255,0.86)', alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 58, height: 58, borderRadius: 29, backgroundColor: '#fff' }} />
          </Pressable>
          <View style={{ width: 50, height: 50, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}>
            <GlyphIcon name="gallery" color="#fff" />
          </View>
        </View>
      ) : phase === 'analyzing' ? (
        <SerifText style={{ paddingTop: 24, paddingBottom: 56, textAlign: 'center', color: 'rgba(255,255,255,0.86)', fontSize: 14, fontStyle: 'italic' }}>identifying plant…</SerifText>
      ) : null}
    </View>
  );
}

function CameraShell({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <View style={{ flex: 1, backgroundColor: '#0a0c0a' }}>
      <View style={{ position: 'absolute', top: 54, left: 16, zIndex: 10 }}>
        <IconButton label="Close camera" onPress={onClose} dark theme={theme}><GlyphIcon name="close" color="#fff" /></IconButton>
      </View>
      {children}
    </View>
  );
}

function CenteredText({ title }: { title: string }) {
  return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#fff' }}>{title}</Text></View>;
}

function WebCameraFallback({ onClose }: { onClose: () => void }) {
  return (
    <CameraShell onClose={onClose}>
      <ViewfinderBg />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 26 }}>
        <SerifText style={{ color: '#fff', fontSize: 30, textAlign: 'center' }}>Camera opens on your phone</SerifText>
        <Text style={{ color: 'rgba(255,255,255,0.76)', textAlign: 'center', lineHeight: 21, marginTop: 10 }}>
          Web keeps the botanical camera mock so static export works. Use Expo Go for real photo capture and local SQLite saves.
        </Text>
      </View>
    </CameraShell>
  );
}

function ViewfinderBg() {
  return (
    <View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: '#2c4030' }}>
      <View style={{ position: 'absolute', left: -70, top: 120, width: 240, height: 180, borderRadius: 120, backgroundColor: 'rgba(125,162,89,0.5)', transform: [{ rotate: '-22deg' }] }} />
      <View style={{ position: 'absolute', right: -90, bottom: 120, width: 280, height: 220, borderRadius: 150, backgroundColor: 'rgba(62,92,58,0.78)', transform: [{ rotate: '28deg' }] }} />
    </View>
  );
}

function Crosshair() {
  return (
    <View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', width: '72%', height: '58%', borderColor: 'rgba(255,255,255,0.36)', borderWidth: 1, borderRadius: 28 }} />
      <View style={{ borderRadius: 999, paddingVertical: 7, paddingHorizontal: 13, backgroundColor: 'rgba(0,0,0,0.38)' }}>
        <SerifText style={{ color: '#fff', fontSize: 13, fontStyle: 'italic' }}>frame the leaves</SerifText>
      </View>
    </View>
  );
}

function ScanningOverlay() {
  return (
    <View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(10,12,10,0.35)', alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', left: 40, right: 40, top: '46%', height: 2, backgroundColor: theme.leaf2 }} />
      <View style={{ position: 'absolute', bottom: 90, borderRadius: 999, paddingVertical: 11, paddingHorizontal: 15, backgroundColor: 'rgba(255,255,255,0.16)', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.leaf2 }} />
        <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>Preparing garden entry…</Text>
      </View>
    </View>
  );
}

function cleanPlantTitle(analysis: AnalysisResult | null) {
  const direct = analysis?.output.visualCommonName?.trim();
  if (direct) return tidyPlantName(direct);
  const source = analysis?.output.openIdentification?.trim() || analysis?.output.summary?.trim() || '';
  if (!source) return null;
  const withoutLead = source
    .replace(/^the\s+plant\s+(?:appears|looks|seems)\s+to\s+be\s+/i, '')
    .replace(/^this\s+(?:appears|looks|seems)\s+to\s+be\s+/i, '')
    .replace(/^it\s+(?:appears|looks|seems)\s+to\s+be\s+/i, '')
    .replace(/^a\s+photo\s+of\s+/i, '')
    .replace(/^an?\s+/i, '');
  const beforeBreak = withoutLead.split(/[.;:,()]/)[0]?.trim() || withoutLead;
  return tidyPlantName(beforeBreak.split(/\s+/).slice(0, 4).join(' '));
}

function tidyPlantName(value: string) {
  const cleaned = value.replace(/\s+/g, ' ').replace(/^["'“”]+|["'“”]+$/g, '').trim();
  if (!cleaned) return null;
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function IdentifiedBubble({ plants, selectedPlant, selectedPlantId, onPlant, addToInventory, onAddToInventory, onSave, onRetry, saving, analysis, analysisFailed, diagnostics }: { plants: PlantRecord[]; selectedPlant: PlantRecord | null; selectedPlantId: string; onPlant: (id: string) => void; addToInventory: boolean; onAddToInventory: () => void; onSave: () => void; onRetry: () => void; saving: boolean; analysis: AnalysisResult | null; analysisFailed: boolean; diagnostics: GardenAgentDiagnostics | null }) {
  const previewPlant = selectedPlant ?? plants[0];
  const swatch = previewPlant ? plantSwatch(previewPlant) : [theme.primary, theme.leaf2];
  const topMatch = analysis?.output.plantMatches?.[0];
  const isAiSuggestion = Boolean(topMatch && selectedPlant && topMatch.plantId === selectedPlant.id);
  const confidence = topMatch?.confidence ?? analysis?.output.confidence ?? null;
  const hasConfidentMatch = Boolean(topMatch && topMatch.confidence >= MIN_AUTO_SUGGEST_CONFIDENCE);
  const confidenceLabel = confidence == null ? null : confidence >= 0.8 ? 'High confidence' : confidence >= MIN_AUTO_SUGGEST_CONFIDENCE ? 'Possible match' : 'Not sure';
  const tags = analysis?.output.tags?.slice(0, 4) ?? [];
  const selectedPlantName = selectedPlant ? selectedPlant.commonName || selectedPlant.displayName : null;
  const visualName = cleanPlantTitle(analysis);
  const visualDetail = analysis?.output.openIdentification?.trim();
  const canAddIdentifiedPlant = Boolean(visualName && !hasConfidentMatch);
  const title = hasConfidentMatch && selectedPlantName ? selectedPlantName : visualName || selectedPlantName || 'Unknown plant';
  const diagnosticMessage = diagnostics?.message ?? 'AI request failed; choose a plant to save locally.';
  const diagnosticTitle = diagnostics?.failureKind === 'api_unreachable' ? 'API unreachable' : diagnostics?.failureKind === 'agent_unconfigured' ? 'AI not configured' : 'AI unavailable';
  const cardBg = '#fff8ea';
  const inkStrong = '#1f2a23';
  const inkBody = '#374333';
  const inkMuted = '#596651';
  const inactivePillBg = '#eadcc6';
  const selectedBg = '#5f7f3e';
  const selectedText = '#fff8ea';
  const tagBg = '#d6e4bf';
  const borderColor = 'rgba(31,42,35,0.2)';
  return (
    <View style={{ position: 'absolute', left: 18, right: 18, bottom: 24, borderRadius: 24, backgroundColor: cardBg, padding: 18, shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 6 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <PhotoTreatment tone={swatch[0]} glyph={previewPlant?.glyph ?? undefined} style={{ width: 58, height: 58 }} radius={15} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: inkMuted, fontSize: 11, fontWeight: '800', letterSpacing: 1.1, textTransform: 'uppercase' }}>{analysisFailed ? diagnosticTitle : addToInventory ? 'Add to inventory' : hasConfidentMatch && isAiSuggestion ? 'AI suggested' : 'Choose plant'}</Text>
          <SerifText style={{ color: inkStrong, fontSize: 28, lineHeight: 33, fontStyle: 'italic' }}>{title}</SerifText>
          <Text style={{ color: inkBody, opacity: 1, fontSize: 12, lineHeight: 16 }}>{analysisFailed ? diagnosticMessage : addToInventory ? 'Create a new plant profile from this ID' : hasConfidentMatch ? `${confidenceLabel} · confirm or choose another` : 'No inventory match yet · add it or choose one'}</Text>
        </View>
      </View>

      {visualDetail && visualDetail !== title ? <Text style={{ color: inkMuted, opacity: 1, fontSize: 12, lineHeight: 17, marginTop: 12 }}>Looks like: {visualDetail}</Text> : null}
      {analysis?.output.summary ? <Text style={{ color: inkBody, opacity: 1, fontSize: 13, lineHeight: 19, marginTop: 8 }}>{analysis.output.summary}</Text> : null}
      {tags.length > 0 ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
          {tags.map((tag) => (
            <View key={tag.label} style={{ minHeight: 28, borderRadius: 999, paddingHorizontal: 10, backgroundColor: tagBg, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: inkStrong, fontSize: 11, lineHeight: 14, fontWeight: '800' }}>{tag.label}</Text>
            </View>
          ))}
        </View>
      ) : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 14, paddingBottom: 16, alignItems: 'center' }}>
        {canAddIdentifiedPlant ? (
          <Pressable onPress={onAddToInventory} style={{ minHeight: 34, borderRadius: 999, paddingHorizontal: 13, backgroundColor: addToInventory ? selectedBg : inactivePillBg, borderWidth: 1, borderColor: addToInventory ? selectedBg : borderColor, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: addToInventory ? selectedText : inkStrong, fontSize: 12, lineHeight: 15, fontWeight: '800' }}>Add {visualName}</Text>
          </Pressable>
        ) : null}
        {plants.map((plant) => {
          const label = plant.commonName || plant.displayName;
          return (
            <Pressable key={plant.id} onPress={() => onPlant(plant.id)} style={{ minHeight: 34, borderRadius: 999, paddingHorizontal: 13, backgroundColor: selectedPlantId === plant.id && !addToInventory ? selectedBg : inactivePillBg, borderWidth: 1, borderColor: selectedPlantId === plant.id && !addToInventory ? selectedBg : borderColor, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: selectedPlantId === plant.id && !addToInventory ? selectedText : inkStrong, fontSize: 12, lineHeight: 15, fontWeight: '800' }}>{label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Pressable onPress={onRetry} disabled={saving} style={{ flex: 1, minHeight: 44, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: inactivePillBg, borderWidth: 1, borderColor }}><Text style={{ color: inkStrong, fontWeight: '700', lineHeight: 17 }}>Retake</Text></Pressable>
        <Pressable onPress={onSave} disabled={saving || (!selectedPlant && !addToInventory)} style={{ flex: 1.3, minHeight: 44, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: selectedPlant || addToInventory ? selectedBg : inactivePillBg, opacity: saving || (!selectedPlant && !addToInventory) ? 0.72 : 1, borderWidth: 1, borderColor: selectedPlant || addToInventory ? selectedBg : borderColor }}><Text style={{ color: selectedPlant || addToInventory ? selectedText : inkStrong, fontWeight: '800', lineHeight: 17 }}>{saving ? 'Saving…' : addToInventory ? `Add ${visualName ?? 'plant'}` : selectedPlantName ? `Save to ${selectedPlantName}` : 'Choose plant to save'}</Text></Pressable>
      </View>
    </View>
  );
}
