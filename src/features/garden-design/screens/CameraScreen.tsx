import { CameraCapturedPicture, CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Image, Platform, Pressable, ScrollView, Text, View } from 'react-native';

import { useHomeGardenRecords } from '../../garden-records/hooks/useGardenRecords';
import { PlantRecord } from '../../garden-records/models/GardenRecordTypes';
import { cameraCaptureService } from '../../garden-records/services/CameraCaptureService';
import { plantSwatch } from '../../garden-records/viewModels';
import { GlyphIcon, IconButton, PhotoTreatment, SerifText } from '../components/primitives';
import { theme } from '../theme';

type Phase = 'viewfinder' | 'scanning' | 'identified' | 'saving';

export function CameraScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const initialPlantId = Array.isArray(params.plantId) ? params.plantId[0] : params.plantId;
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const { data } = useHomeGardenRecords();
  const [phase, setPhase] = useState<Phase>('viewfinder');
  const [captured, setCaptured] = useState<CameraCapturedPicture | null>(null);
  const [selectedPlantId, setSelectedPlantId] = useState(initialPlantId ?? 'sungold');
  const [error, setError] = useState<string | null>(null);

  const plants = data.plants;
  const selectedPlant = plants.find((plant) => plant.id === selectedPlantId) ?? plants[0];

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
      setPhase('scanning');
      setTimeout(() => setPhase('identified'), 1100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not capture photo.');
    }
  };

  const save = async () => {
    if (!captured || !selectedPlant) return;
    try {
      setError(null);
      setPhase('saving');
      await cameraCaptureService.saveCapturedPhoto({
        plantId: selectedPlant.id,
        localUri: captured.uri,
        width: captured.width,
        height: captured.height,
        mimeType: 'image/jpeg',
      });
      router.replace(`/plants/${selectedPlant.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save photo.');
      setPhase('identified');
    }
  };

  const retake = () => {
    setCaptured(null);
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
        {phase === 'scanning' ? <ScanningOverlay /> : null}
        {(phase === 'identified' || phase === 'saving') && selectedPlant ? (
          <IdentifiedBubble
            plants={plants}
            selectedPlant={selectedPlant}
            selectedPlantId={selectedPlantId}
            onPlant={setSelectedPlantId}
            onSave={save}
            onRetry={retake}
            saving={phase === 'saving'}
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
      ) : phase === 'scanning' ? (
        <SerifText style={{ paddingTop: 24, paddingBottom: 56, textAlign: 'center', color: 'rgba(255,255,255,0.86)', fontSize: 14, fontStyle: 'italic' }}>looking closely…</SerifText>
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

function IdentifiedBubble({ plants, selectedPlant, selectedPlantId, onPlant, onSave, onRetry, saving }: { plants: PlantRecord[]; selectedPlant: PlantRecord; selectedPlantId: string; onPlant: (id: string) => void; onSave: () => void; onRetry: () => void; saving: boolean }) {
  const swatch = plantSwatch(selectedPlant);
  return (
    <View style={{ position: 'absolute', left: 18, right: 18, bottom: 24, borderRadius: 24, backgroundColor: 'rgba(255,253,247,0.94)', padding: 18 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <PhotoTreatment tone={swatch[0]} glyph={selectedPlant.glyph ?? undefined} style={{ width: 58, height: 58 }} radius={15} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.inkMuted, fontSize: 11, fontWeight: '800', letterSpacing: 1.1, textTransform: 'uppercase' }}>Save this photo to</Text>
          <SerifText style={{ color: theme.ink, fontSize: 24, fontStyle: 'italic' }}>{selectedPlant.commonName}</SerifText>
          <Text style={{ color: theme.inkSoft, fontSize: 12 }}>Manual match for now · AI comes next</Text>
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 14 }}>
        {plants.map((plant) => (
          <Pressable key={plant.id} onPress={() => onPlant(plant.id)} style={{ borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: selectedPlantId === plant.id ? theme.primary : theme.bgSoft }}>
            <Text style={{ color: selectedPlantId === plant.id ? theme.bg : theme.inkSoft, fontSize: 12, fontWeight: '800' }}>{plant.displayName}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Pressable onPress={onRetry} disabled={saving} style={{ flex: 1, borderRadius: 999, paddingVertical: 12, alignItems: 'center', backgroundColor: theme.bgSoft }}><Text style={{ color: theme.inkSoft, fontWeight: '700' }}>Retake</Text></Pressable>
        <Pressable onPress={onSave} disabled={saving} style={{ flex: 1.3, borderRadius: 999, paddingVertical: 12, alignItems: 'center', backgroundColor: theme.primary }}><Text style={{ color: theme.bg, fontWeight: '800' }}>{saving ? 'Saving…' : `Save to ${selectedPlant.displayName}`}</Text></Pressable>
      </View>
    </View>
  );
}
