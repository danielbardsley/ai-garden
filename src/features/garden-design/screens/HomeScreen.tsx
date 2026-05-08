import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { plants, relDays } from '../data';
import { BottomNav } from '../components/BottomNav';
import { GlyphIcon, MonoText, PhotoTreatment, ScreenScaffold, SectionHeader, SerifText, StatusDot } from '../components/primitives';
import { theme } from '../theme';

export function HomeScreen() {
  const router = useRouter();
  const today = plants.filter((plant) => plant.status.kind === 'warn' || /today|tomorrow/i.test(plant.status.next));

  return (
    <ScreenScaffold>
      <ScrollView contentContainerStyle={{ paddingTop: 54, paddingBottom: 120 }}>
        <View style={{ paddingHorizontal: 20, marginBottom: 22 }}>
          <Text style={{ color: theme.inkMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 6 }}>
            Thursday, May 7
          </Text>
          <SerifText style={{ color: theme.ink, fontSize: 38, lineHeight: 40, letterSpacing: -0.5 }}>
            Good morning,{`\n`}
            <SerifText style={{ color: theme.primary, fontSize: 38, fontStyle: 'italic' }}>the deck</SerifText> is waking up.
          </SerifText>
        </View>

        <View style={{ marginHorizontal: 20, marginBottom: 24, padding: 15, backgroundColor: theme.surface, borderRadius: 18, borderWidth: 0.5, borderColor: theme.line, flexDirection: 'row', alignItems: 'center', gap: 13 }}>
          <View style={{ width: 40, height: 40, borderRadius: 13, backgroundColor: theme.leaf3, alignItems: 'center', justifyContent: 'center' }}>
            <GlyphIcon name="leaf" color={theme.primaryDeep} size={20} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.ink, fontSize: 15, fontWeight: '600' }}>62°F · partly sun</Text>
            <Text style={{ color: theme.inkSoft, fontSize: 12, marginTop: 2 }}>Last frost 22 days ago · zone 7a</Text>
          </View>
          <SerifText style={{ color: theme.inkSoft, fontSize: 14, fontStyle: 'italic' }}>week 19</SerifText>
        </View>

        {today.length > 0 ? (
          <View style={{ marginBottom: 26 }}>
            <SectionHeader title="On your list today" action={`${today.length} items`} theme={theme} />
            <View style={{ paddingHorizontal: 20, gap: 8 }}>
              {today.map((plant) => (
                <Pressable key={plant.id} onPress={() => router.push(`/plants/${plant.id}`)} style={{ backgroundColor: theme.surface, borderRadius: 15, borderWidth: 0.5, borderColor: theme.line, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <PhotoTreatment tone={plant.swatch[0]} glyph={plant.glyph} style={{ width: 40, height: 40 }} radius={11} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.ink, fontSize: 14, fontWeight: '600' }}>{plant.status.next} · <Text style={{ color: theme.inkSoft, fontWeight: '400' }}>{plant.common}</Text></Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
                      <StatusDot kind={plant.status.kind} theme={theme} />
                      <Text style={{ color: theme.inkMuted, fontSize: 11 }}>{plant.status.label} · {plant.location}</Text>
                    </View>
                  </View>
                  <Text style={{ color: theme.inkMuted, fontSize: 20 }}>›</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        <SectionHeader title="In the garden" action={`${plants.length} plants`} theme={theme} />
        <View style={{ paddingHorizontal: 20, flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {plants.map((plant) => {
            const latest = plant.photos[0];
            return (
              <Pressable key={plant.id} onPress={() => router.push(`/plants/${plant.id}`)} style={{ width: '48%', marginBottom: 10 }}>
                <View style={{ aspectRatio: 1 / 1.15, borderRadius: 16, overflow: 'hidden', borderWidth: 0.5, borderColor: theme.line }}>
                  <PhotoTreatment tone={latest.tone} glyph={plant.glyph} style={{ flex: 1 }} />
                  <View style={{ position: 'absolute', top: 8, left: 8, borderRadius: 999, backgroundColor: theme.name === 'Forest' ? 'rgba(31,42,35,0.82)' : 'rgba(255,255,255,0.86)', paddingVertical: 4, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center' }}>
                    <StatusDot kind={plant.status.kind} theme={theme} />
                    <Text style={{ color: theme.ink, fontSize: 10, fontWeight: '600' }}>{plant.status.label}</Text>
                  </View>
                </View>
                <View style={{ paddingHorizontal: 4, paddingTop: 9 }}>
                  <SerifText style={{ color: theme.ink, fontSize: 18, fontWeight: '600' }}>{plant.name}</SerifText>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 3 }}>
                    <Text style={{ color: theme.inkSoft, fontSize: 11 }}>{plant.common}</Text>
                    <MonoText style={{ color: theme.inkMuted, fontSize: 10 }}>{relDays(latest.d)}</MonoText>
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
