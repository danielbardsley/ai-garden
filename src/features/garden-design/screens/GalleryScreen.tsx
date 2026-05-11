import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { PhotoRecord } from '../../garden-records/models/GardenRecordTypes';
import { galleryPhotoContextLabel } from '../galleryMetadata';
import { fmtDate, plantSwatch } from '../../garden-records/viewModels';
import { useGalleryRecords, usePhotoTags } from '../../garden-records/hooks/useGardenRecords';
import { BottomNav } from '../components/BottomNav';
import { Chip, GlyphIcon, IconButton, PhotoTreatment, ScreenScaffold, SerifText } from '../components/primitives';
import { theme } from '../theme';

export function GalleryScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState('all');
  const [lightbox, setLightbox] = useState<PhotoRecord | null>(null);
  const { data, loading, error } = useGalleryRecords(filter === 'all' ? undefined : filter);
  const { plants, photos } = data;
  const groups = photos.reduce<Record<string, { label: string; items: PhotoRecord[] }>>((acc, photo) => {
    const value = photo.capturedOn ?? '2026-05-07';
    const date = new Date(`${value}T12:00:00`);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    acc[key] ??= { label: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }), items: [] };
    acc[key].items.push(photo);
    return acc;
  }, {});
  const keys = Object.keys(groups).sort().reverse();

  return (
    <ScreenScaffold>
      <ScrollView contentContainerStyle={{ paddingTop: 54, paddingBottom: 122 }}>
        <View style={{ paddingHorizontal: 20, marginBottom: 18 }}>
          <Text style={{ color: theme.inkMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 6 }}>Gallery</Text>
          <SerifText style={{ color: theme.ink, fontSize: 36, lineHeight: 38 }}>
            <SerifText style={{ color: theme.primary, fontSize: 36, fontStyle: 'italic', fontWeight: '700' }}>{photos.length}</SerifText> entries,{`\n`}across <SerifText style={{ color: theme.inkSoft, fontSize: 36, fontStyle: 'italic', fontWeight: '600' }}>{plants.length}</SerifText> plants
          </SerifText>
          {loading ? <Text style={{ color: theme.inkMuted, marginTop: 10 }}>Loading local photos…</Text> : null}
          {error ? <Text style={{ color: theme.accent, marginTop: 10 }}>Storage error: {error.message}</Text> : null}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 20, paddingBottom: 18 }}>
          <Chip label="All photos" active={filter === 'all'} onPress={() => setFilter('all')} theme={theme} />
          {plants.map((plant) => <Chip key={plant.id} label={plant.displayName} active={filter === plant.id} onPress={() => setFilter(plant.id)} theme={theme} swatch={plantSwatch(plant)[0]} />)}
        </ScrollView>

        {keys.map((key) => (
          <View key={key} style={{ marginBottom: 26 }}>
            <View style={{ paddingHorizontal: 20, marginBottom: 10, flexDirection: 'row', alignItems: 'baseline', gap: 12 }}>
              <SerifText style={{ color: theme.ink, fontSize: 17, fontStyle: 'italic' }}>{groups[key].label}</SerifText>
              <View style={{ flex: 1, height: 1, backgroundColor: theme.line }} />
              <Text style={{ color: theme.inkMuted, fontSize: 11 }}>{groups[key].items.length}</Text>
            </View>
            <View style={{ paddingHorizontal: 20, flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {groups[key].items.map((photo) => (
                <Pressable key={photo.id} onPress={() => setLightbox(photo)} style={{ width: '32%', aspectRatio: 1, borderRadius: 11, overflow: 'hidden' }}>
                  <PhotoTreatment tone={photo.tone ?? undefined} imageUri={photo.localUri} style={{ flex: 1 }} radius={11} />
                  <View style={{ position: 'absolute', top: 5, left: 5, borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.42)', paddingHorizontal: 6, paddingVertical: 2 }}>
                    <Text style={{ color: '#fff', fontSize: 9 }}>{fmtDate(photo.capturedOn ?? '2026-05-07', { short: true })}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        {filter !== 'all' ? (
          <View style={{ paddingHorizontal: 20 }}>
            <Pressable onPress={() => router.push(`/plants/${filter}`)} style={{ borderRadius: 15, backgroundColor: theme.surface, borderWidth: 0.5, borderColor: theme.line, padding: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ color: theme.ink, fontSize: 14, fontWeight: '600' }}>Open {plants.find((plant) => plant.id === filter)?.displayName ?? 'plant'} detail</Text>
              <Text style={{ color: theme.inkMuted, fontSize: 20 }}>›</Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
      <BottomNav />
      <PhotoLightbox photo={lightbox} onClose={() => setLightbox(null)} />
    </ScreenScaffold>
  );
}

function PhotoLightbox({ photo, onClose }: { photo: PhotoRecord | null; onClose: () => void }) {
  const router = useRouter();
  const { data: tags } = usePhotoTags(photo?.id);
  if (!photo) return null;
  const aiTags = tags.filter((tag) => tag.source === 'ai');
  const fallbackTags = tags.length > 0 ? tags : [];
  const visibleTags = aiTags.length > 0 ? aiTags : fallbackTags;
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(15,18,15,0.96)', paddingTop: 54 }}>
        <View style={{ paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <IconButton label="Close photo" onPress={onClose} dark theme={theme}><GlyphIcon name="close" color="#fff" /></IconButton>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: 'rgba(255,255,255,0.72)', fontSize: 11, letterSpacing: 0.5 }}>{fmtDate(photo.capturedOn ?? '2026-05-07', { year: true }).toUpperCase()}</Text>
            <Text style={{ color: '#fff', fontSize: 14, marginTop: 2 }}>{galleryPhotoContextLabel(photo, visibleTags.length)}</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 18 }}>
          <PhotoTreatment tone={photo.tone ?? undefined} imageUri={photo.localUri} style={{ width: '100%', aspectRatio: 1 / 1.18 }} radius={18} />
        </View>
        <View style={{ margin: 16, marginBottom: 28, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.10)', padding: 16 }}>
          <Text style={{ color: '#fff', fontSize: 14, lineHeight: 20, marginBottom: 12 }}>{photo.note}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 9 }}>
            <GlyphIcon name="sparkle" color="#fff" size={15} />
            <Text style={{ color: 'rgba(255,255,255,0.72)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.1 }}>AI auto-tags</Text>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {visibleTags.length > 0 ? visibleTags.map((tag) => <Text key={tag.id} style={{ color: '#fff', fontSize: 12, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: tag.source === 'ai' ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.12)' }}>{tag.tag}</Text>) : <Text style={{ color: 'rgba(255,255,255,0.64)', fontSize: 12 }}>No tags saved for this photo yet.</Text>}
          </View>
          {photo.plantId ? (
            <Pressable onPress={() => { onClose(); router.push(`/plants/${photo.plantId}`); }} style={{ marginTop: 12 }}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>Open plant →</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
