import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { fmtDate, plantById, PlantPhoto, relDays } from '../data';
import { BottomNav } from '../components/BottomNav';
import { GlyphIcon, IconButton, MonoText, PhotoTreatment, ScreenScaffold, SerifText, StatusDot } from '../components/primitives';
import { theme } from '../theme';

export function PlantDetailScreen() {
  const router = useRouter();
  const { plantId } = useLocalSearchParams();
  const plant = plantById(plantId);
  const [tab, setTab] = useState<'timeline' | 'chat' | 'care'>('timeline');
  const latest = plant.photos[0];
  const yearsTracking = 2026 - plant.yearStarted + 1;

  return (
    <ScreenScaffold>
      <ScrollView contentContainerStyle={{ paddingBottom: 124 }}>
        <View style={{ width: '100%', aspectRatio: 1 / 1.04 }}>
          <PhotoTreatment tone={latest.tone} glyph={plant.glyph} style={{ flex: 1, borderRadius: 0 }} radius={0} />
          <View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.12)' }} />
          <View style={{ position: 'absolute', top: 54, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' }}>
            <IconButton label="Back" onPress={() => router.push('/')} theme={theme}><GlyphIcon name="back" color={theme.ink} size={28} /></IconButton>
            <IconButton label="More" theme={theme}><Text style={{ color: theme.ink, fontWeight: '800' }}>•••</Text></IconButton>
          </View>
          <View style={{ position: 'absolute', left: 24, right: 24, bottom: 24 }}>
            <Text style={{ color: 'rgba(255,255,255,0.86)', fontSize: 11, letterSpacing: 1.6, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 }}>{plant.common}</Text>
            <SerifText style={{ color: '#fff', fontSize: 42, lineHeight: 44 }}>{plant.name}</SerifText>
            <SerifText style={{ color: 'rgba(255,255,255,0.86)', fontSize: 14, fontStyle: 'italic', marginTop: 4 }}>{plant.variety}</SerifText>
          </View>
        </View>

        <View style={{ backgroundColor: theme.surface, borderBottomWidth: 0.5, borderBottomColor: theme.line, padding: 16, flexDirection: 'row', gap: 12 }}>
          <Stat value={`Y${yearsTracking}`} label="tracking" />
          <Divider />
          <Stat value={`${plant.photos.length}`} label="photos" />
          <Divider />
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}><StatusDot kind={plant.status.kind} theme={theme} /><SerifText style={{ fontSize: 19, color: theme.ink }}>{plant.status.label}</SerifText></View>
            <Text style={{ color: theme.inkMuted, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, marginTop: 3 }}>status</Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 18 }}>
          <SerifText style={{ color: theme.inkSoft, fontSize: 16, lineHeight: 23, fontStyle: 'italic' }}>{plant.summary}</SerifText>
          <Text style={{ color: theme.inkMuted, fontSize: 12, marginTop: 12 }}>📍 {plant.location} · Planted {fmtDate(plant.plantedAt, { year: true })}</Text>
        </View>

        <View style={{ marginHorizontal: 20, marginTop: 20, marginBottom: 16, padding: 3, borderRadius: 12, backgroundColor: theme.bgSoft, flexDirection: 'row' }}>
          {[
            ['timeline', 'Timeline'],
            ['chat', 'Ask AI'],
            ['care', 'Care'],
          ].map(([key, label]) => (
            <Pressable key={key} onPress={() => setTab(key as typeof tab)} style={{ flex: 1, borderRadius: 9, paddingVertical: 9, alignItems: 'center', backgroundColor: tab === key ? theme.surface : 'transparent' }}>
              <Text style={{ color: tab === key ? theme.ink : theme.inkSoft, fontSize: 13, fontWeight: '700' }}>{label}</Text>
            </Pressable>
          ))}
        </View>

        {tab === 'timeline' ? <Timeline photos={plant.photos} glyph={plant.glyph} onCamera={() => router.push('/camera')} /> : null}
        {tab === 'chat' ? <StaticChat plantName={plant.name} common={plant.common} photoCount={plant.photos.length} /> : null}
        {tab === 'care' ? <CareNotes notes={plant.care} /> : null}
      </ScrollView>
      <BottomNav />
    </ScreenScaffold>
  );
}

function Divider() { return <View style={{ width: 0.5, backgroundColor: theme.line }} />; }
function Stat({ value, label }: { value: string; label: string }) {
  return <View style={{ flex: 1 }}><SerifText style={{ fontSize: 19, color: theme.ink }}>{value}</SerifText><Text style={{ color: theme.inkMuted, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, marginTop: 3 }}>{label}</Text></View>;
}

function Timeline({ photos, glyph, onCamera }: { photos: PlantPhoto[]; glyph: string; onCamera: () => void }) {
  const byYear = photos.reduce<Record<string, PlantPhoto[]>>((acc, photo) => {
    const year = photo.d.slice(0, 4);
    acc[year] ??= [];
    acc[year].push(photo);
    return acc;
  }, {});
  return (
    <View style={{ paddingHorizontal: 20 }}>
      <Pressable onPress={onCamera} style={{ borderRadius: 13, borderWidth: 1, borderColor: theme.primary, padding: 15, alignItems: 'center', marginBottom: 18 }}>
        <Text style={{ color: theme.primary, fontSize: 13, fontWeight: '700' }}>◉ Log a new photo</Text>
      </Pressable>
      {Object.keys(byYear).sort().reverse().map((year) => (
        <View key={year} style={{ marginBottom: 22 }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10, marginBottom: 12 }}>
            <SerifText style={{ color: theme.ink, fontSize: 23 }}>{year}</SerifText>
            <View style={{ flex: 1, height: 1, backgroundColor: theme.line }} />
            <Text style={{ color: theme.inkMuted, fontSize: 11 }}>{byYear[year].length} entries</Text>
          </View>
          {byYear[year].map((photo) => (
            <View key={photo.id} style={{ flexDirection: 'row', gap: 14, marginBottom: 12 }}>
              <PhotoTreatment tone={photo.tone} glyph={glyph} style={{ width: 78, height: 78 }} radius={14} />
              <View style={{ flex: 1, paddingTop: 4 }}>
                <MonoText style={{ fontSize: 11, color: theme.inkMuted }}>{fmtDate(photo.d, { short: true }).toUpperCase()} · {relDays(photo.d)}</MonoText>
                <Text style={{ color: theme.ink, fontSize: 14, lineHeight: 20, marginTop: 4 }}>{photo.note}</Text>
              </View>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

function StaticChat({ plantName, common, photoCount }: { plantName: string; common: string; photoCount: number }) {
  return (
    <View style={{ paddingHorizontal: 20 }}>
      <View style={{ backgroundColor: theme.bgSoft, borderRadius: 17, padding: 14, gap: 10 }}>
        <ChatBubble text={`Hey! I'm tracking your ${common} with you. I can see ${photoCount} photos so far. What's on your mind?`} />
        <ChatBubble me text="Should I water today?" />
        <ChatBubble text="Visual placeholder only for now — future AI advice will live here." />
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 12 }}>
        {['Is it ready to water?', 'Why might leaves yellow?', 'When should I prune?'].map((q) => <Text key={q} style={{ color: theme.inkSoft, fontSize: 12, paddingHorizontal: 11, paddingVertical: 8, borderRadius: 999, borderWidth: 0.5, borderColor: theme.line }}>{q}</Text>)}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingLeft: 14, paddingRight: 6, paddingVertical: 6, backgroundColor: theme.surface, borderRadius: 999, borderWidth: 0.5, borderColor: theme.line }}>
        <TextInput editable={false} value="" placeholder={`Ask about your ${plantName.toLowerCase()}…`} placeholderTextColor={theme.inkMuted} style={{ flex: 1, color: theme.ink }} />
        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: theme.bgSoft, alignItems: 'center', justifyContent: 'center' }}><GlyphIcon name="send" color={theme.inkMuted} size={15} /></View>
      </View>
    </View>
  );
}

function ChatBubble({ text, me = false }: { text: string; me?: boolean }) {
  return <View style={{ alignSelf: me ? 'flex-end' : 'flex-start', maxWidth: '82%', borderRadius: 16, padding: 12, backgroundColor: me ? theme.primary : theme.surface }}><Text style={{ color: me ? '#fff' : theme.ink, fontSize: 14, lineHeight: 20 }}>{text}</Text></View>;
}

function CareNotes({ notes }: { notes: string[] }) {
  return <View style={{ paddingHorizontal: 20, gap: 10 }}>{notes.map((note, index) => <View key={note} style={{ backgroundColor: theme.surface, borderRadius: 15, borderWidth: 0.5, borderColor: theme.line, padding: 15 }}><Text style={{ color: theme.inkMuted, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 5 }}>Care note {index + 1}</Text><Text style={{ color: theme.ink, fontSize: 14, lineHeight: 20 }}>{note}</Text></View>)}</View>;
}
