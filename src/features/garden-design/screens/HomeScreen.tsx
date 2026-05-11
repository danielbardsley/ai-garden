import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { useHomeGardenRecords } from '../../garden-records/hooks/useGardenRecords';
import { GardenSetup } from '../../garden-setup/models/GardenSetup';
import { latestPhotoForPlant, plantSwatch, relDays } from '../../garden-records/viewModels';
import { HomeWeatherWidget } from '../../weather/components/HomeWeatherWidget';
import { BottomNav } from '../components/BottomNav';
import { MonoText, PhotoTreatment, ScreenScaffold, SectionHeader, SerifText, StatusDot } from '../components/primitives';
import { theme } from '../theme';

export function HomeScreen({ gardenSetup, justOnboarded = false }: { gardenSetup?: GardenSetup | null; justOnboarded?: boolean }) {
  const router = useRouter();
  const { data, loading, error } = useHomeGardenRecords();
  const { plants, attentionPlants, photos } = data;
  const gardenName = gardenSetup?.name?.trim() || 'the garden';

  return (
    <ScreenScaffold>
      <ScrollView contentContainerStyle={{ paddingTop: 54, paddingBottom: 120 }}>
        <View style={{ paddingHorizontal: 20, marginBottom: 22 }}>
          <Text style={{ color: theme.inkMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 6 }}>
            Thursday, May 7
          </Text>
          <SerifText style={{ color: theme.ink, fontSize: 38, lineHeight: 40, letterSpacing: -0.5 }}>
            Good morning,{`\n`}
            <SerifText style={{ color: theme.primary, fontSize: 38, fontStyle: 'italic' }}>{gardenName.toLowerCase()}</SerifText> is waking up.
          </SerifText>
          {loading ? <Text style={{ color: theme.inkMuted, marginTop: 10 }}>Opening local garden journal…</Text> : null}
          {error ? <Text style={{ color: theme.accent, marginTop: 10 }}>Storage error: {error.message}</Text> : null}
          {justOnboarded ? (
            <View style={{ marginTop: 16, padding: 15, borderRadius: 16, backgroundColor: theme.surface, borderWidth: 0.5, borderColor: theme.line }}>
              <Text style={{ color: theme.inkMuted, fontSize: 10, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 5 }}>Garden setup complete</Text>
              <Text style={{ color: theme.inkSoft, fontSize: 13, lineHeight: 19 }}>Next, add your first plant. Use the camera button below to identify a leaf and start its timeline.</Text>
              <Pressable onPress={() => router.push('/camera')} style={{ alignSelf: 'flex-start', marginTop: 12, borderRadius: 999, backgroundColor: theme.primary, paddingHorizontal: 14, paddingVertical: 9 }}>
                <Text style={{ color: theme.bg, fontSize: 12, fontWeight: '800' }}>Add first plant</Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        <HomeWeatherWidget gardenCreatedAt={gardenSetup?.createdAt} setupZone={gardenSetup?.hardinessZone} />

        {attentionPlants.length > 0 ? (
          <View style={{ marginBottom: 26 }}>
            <SectionHeader title="On your list today" action={`${attentionPlants.length} items`} theme={theme} />
            <View style={{ paddingHorizontal: 20, gap: 8 }}>
              {attentionPlants.map((plant) => {
                const swatch = plantSwatch(plant);
                return (
                  <Pressable key={plant.id} onPress={() => router.push(`/plants/${plant.id}`)} style={{ backgroundColor: theme.surface, borderRadius: 15, borderWidth: 0.5, borderColor: theme.line, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <PhotoTreatment tone={swatch[0]} style={{ width: 40, height: 40 }} radius={11} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: theme.ink, fontSize: 14, fontWeight: '600' }}>{plant.nextActionLabel} · <Text style={{ color: theme.inkSoft, fontWeight: '400' }}>{plant.commonName}</Text></Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
                        <StatusDot kind={plant.statusKind === 'archived' ? 'idle' : plant.statusKind} theme={theme} />
                        <Text style={{ color: theme.inkMuted, fontSize: 11 }}>{plant.statusLabel} · {plant.locationName}</Text>
                      </View>
                    </View>
                    <Text style={{ color: theme.inkMuted, fontSize: 20 }}>›</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        <SectionHeader title="In the garden" action={`${plants.length} plants`} theme={theme} />
        <View style={{ paddingHorizontal: 20, flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {plants.map((plant) => {
            const swatch = plantSwatch(plant);
            const latest = latestPhotoForPlant(plant, photos);
            return (
              <Pressable key={plant.id} onPress={() => router.push(`/plants/${plant.id}`)} style={{ width: '48%', marginBottom: 10 }}>
                <View style={{ aspectRatio: 1 / 1.15, borderRadius: 16, overflow: 'hidden', borderWidth: 0.5, borderColor: theme.line }}>
                  <PhotoTreatment tone={latest?.tone ?? swatch[0]} imageUri={latest?.localUri} style={{ flex: 1 }} />
                  <View style={{ position: 'absolute', top: 8, left: 8, borderRadius: 999, backgroundColor: theme.name === 'Forest' ? 'rgba(31,42,35,0.82)' : 'rgba(255,255,255,0.86)', paddingVertical: 4, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center' }}>
                    <StatusDot kind={plant.statusKind === 'archived' ? 'idle' : plant.statusKind} theme={theme} />
                    <Text style={{ color: theme.ink, fontSize: 10, fontWeight: '600' }}>{plant.statusLabel}</Text>
                  </View>
                </View>
                <View style={{ paddingHorizontal: 4, paddingTop: 9 }}>
                  <SerifText style={{ color: theme.ink, fontSize: 18, fontWeight: '600' }}>{plant.displayName}</SerifText>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 3 }}>
                    <Text style={{ color: theme.inkSoft, fontSize: 11 }}>{plant.commonName}</Text>
                    <MonoText style={{ color: theme.inkMuted, fontSize: 10 }}>{relDays(latest?.capturedOn)}</MonoText>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={{ marginHorizontal: 20, marginTop: 18, padding: 17, borderRadius: 15, borderWidth: 1, borderColor: theme.line }}>
          <SerifText style={{ textAlign: 'center', color: theme.inkSoft, fontStyle: 'italic', fontSize: 14, lineHeight: 21 }}>
            “Make a journal of every garden by photographing the same pot once a week.”
          </SerifText>
        </View>
      </ScrollView>
      <BottomNav />
    </ScreenScaffold>
  );
}
