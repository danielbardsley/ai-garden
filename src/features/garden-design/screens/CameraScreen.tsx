import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { plantById, plants } from '../data';
import { GlyphIcon, IconButton, PhotoTreatment, SerifText } from '../components/primitives';
import { theme } from '../theme';

type Phase = 'viewfinder' | 'scanning' | 'identified';

export function CameraScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('viewfinder');
  const [matchId, setMatchId] = useState('sungold');
  const match = plantById(matchId);

  const snap = () => {
    const next = plants[Math.floor(Math.random() * Math.min(4, plants.length))];
    setMatchId(next.id);
    setPhase('scanning');
    setTimeout(() => setPhase('identified'), 1400);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0a0c0a' }}>
      <View style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {phase === 'viewfinder' ? <ViewfinderBg /> : <PhotoTreatment tone={match.photos[0].tone} style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, borderRadius: 0 }} radius={0} />}
        {phase === 'viewfinder' ? <Crosshair /> : null}
        {phase === 'scanning' ? <ScanningOverlay /> : null}
        {phase === 'identified' ? <IdentifiedBubble plantId={match.id} onSave={() => router.replace(`/plants/${match.id}`)} onRetry={() => setPhase('viewfinder')} /> : null}

        <View style={{ position: 'absolute', top: 54, left: 16, zIndex: 10 }}>
          <IconButton label="Close camera" onPress={() => router.back()} dark theme={theme}><GlyphIcon name="close" color="#fff" /></IconButton>
        </View>
        <View style={{ position: 'absolute', top: 56, right: 16, zIndex: 10, borderRadius: 999, paddingVertical: 9, paddingHorizontal: 12, backgroundColor: 'rgba(255,255,255,0.18)', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <GlyphIcon name="sparkle" color="#fff" size={15} />
          <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>AI plant ID</Text>
        </View>
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

function ViewfinderBg() {
  return (
    <View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: '#2c4030' }}>
      <View style={{ position: 'absolute', left: -70, top: 120, width: 240, height: 180, borderRadius: 120, backgroundColor: 'rgba(125,162,89,0.5)', transform: [{ rotate: '-22deg' }] }} />
      <View style={{ position: 'absolute', right: -90, bottom: 120, width: 280, height: 220, borderRadius: 150, backgroundColor: 'rgba(62,92,58,0.78)', transform: [{ rotate: '28deg' }] }} />
      <View style={{ position: 'absolute', left: '44%', top: '42%', width: 130, height: 70, borderRadius: 70, backgroundColor: 'rgba(93,122,78,0.42)', transform: [{ rotate: '-45deg' }] }} />
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
      {[['34%', '28%'], ['62%', '35%'], ['48%', '50%'], ['70%', '60%'], ['38%', '70%'], ['58%', '72%']].map(([left, top], index) => (
        <View key={index} style={{ position: 'absolute', left: left as any, top: top as any, width: 9, height: 9, borderRadius: 5, backgroundColor: theme.leaf2 }} />
      ))}
      <View style={{ position: 'absolute', bottom: 90, borderRadius: 999, paddingVertical: 11, paddingHorizontal: 15, backgroundColor: 'rgba(255,255,255,0.16)', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.leaf2 }} />
        <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>Identifying leaves & form…</Text>
      </View>
    </View>
  );
}

function IdentifiedBubble({ plantId, onSave, onRetry }: { plantId: string; onSave: () => void; onRetry: () => void }) {
  const plant = plantById(plantId);
  return (
    <View style={{ position: 'absolute', left: 18, right: 18, bottom: 24, borderRadius: 24, backgroundColor: 'rgba(255,253,247,0.94)', padding: 18 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <PhotoTreatment tone={plant.photos[0].tone} glyph={plant.glyph} style={{ width: 58, height: 58 }} radius={15} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.inkMuted, fontSize: 11, fontWeight: '800', letterSpacing: 1.1, textTransform: 'uppercase' }}>Pretty sure I know this one</Text>
          <SerifText style={{ color: theme.ink, fontSize: 24, fontStyle: 'italic' }}>{plant.common}</SerifText>
          <Text style={{ color: theme.inkSoft, fontSize: 12 }}>94% match · {plant.name}</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
        <Pressable onPress={onRetry} style={{ flex: 1, borderRadius: 999, paddingVertical: 12, alignItems: 'center', backgroundColor: theme.bgSoft }}><Text style={{ color: theme.inkSoft, fontWeight: '700' }}>Retake</Text></Pressable>
        <Pressable onPress={onSave} style={{ flex: 1.3, borderRadius: 999, paddingVertical: 12, alignItems: 'center', backgroundColor: theme.primary }}><Text style={{ color: '#fff', fontWeight: '800' }}>Save to {plant.name}</Text></Pressable>
      </View>
    </View>
  );
}
