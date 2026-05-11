import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { BottomNav } from '../../garden-design/components/BottomNav';
import { ScreenScaffold, SerifText } from '../../garden-design/components/primitives';
import { theme } from '../../garden-design/theme';
import { useGardenSetup } from '../hooks/useGardenSetup';
import { GardenSetupDraft, canSaveProfileDraft, draftFromSetup, normalizeGardenSetupDraft, profileSummaryRows } from '../profileViewModels';
import { gardenLocationDetectionService } from '../services/GardenLocationDetectionService';
import { gardenNameSuggestions, growingSpaceOptions, hardinessZones, sunExposureOptions } from '../onboardingOptions';

export function ProfileScreen() {
  const { setup, loading, error, reload, saveSetup } = useGardenSetup();
  const [draft, setDraft] = useState<GardenSetupDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const rows = useMemo(() => setup ? profileSummaryRows(setup) : [], [setup]);
  const editing = Boolean(draft);
  const set = (patch: Partial<GardenSetupDraft>) => setDraft((current) => current ? { ...current, ...patch } : current);
  const toggleSpace = (id: string) => setDraft((current) => current ? { ...current, growingSpaces: current.growingSpaces.includes(id) ? current.growingSpaces.filter((item) => item !== id) : [...current.growingSpaces, id] } : current);

  const beginEdit = () => {
    if (!setup) return;
    setDraft(draftFromSetup(setup));
    setMessage(null);
  };

  const detectLocation = async () => {
    if (!draft || detecting) return;
    setDetecting(true);
    setMessage(null);
    const result = await gardenLocationDetectionService.detect();
    if (result.status === 'detected') {
      set({
        locationLabel: result.locationLabel,
        locationSource: 'detected',
        latitude: result.coordinates.latitude,
        longitude: result.coordinates.longitude,
        hardinessZone: result.hardinessZone ?? draft.hardinessZone ?? null,
        hardinessZoneSource: result.hardinessZone ? 'detected' : draft.hardinessZoneSource ?? null,
      });
      setMessage(result.hardinessZone ? `Detected ${result.locationLabel} · USDA ${result.hardinessZone}.` : `Detected ${result.locationLabel}. Zone can be set manually.`);
    } else {
      setMessage(result.message);
    }
    setDetecting(false);
  };

  const save = async () => {
    if (!setup || !draft || !canSaveProfileDraft(draft) || saving) return;
    setSaving(true);
    setMessage(null);
    try {
      await saveSetup(normalizeGardenSetupDraft(draft, setup));
      setDraft(null);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not save profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <ProfileStatus title="Opening profile…" body="Checking local garden setup." />;
  if (error) return <ProfileStatus title="Profile needs a retry." body={error.message} action="Retry" onAction={reload} />;
  if (!setup) return <ProfileStatus title="No garden setup yet." body="Open Garden to finish onboarding before editing the profile." action="Retry" onAction={reload} />;

  return (
    <ScreenScaffold>
      <ScrollView contentContainerStyle={{ paddingTop: 54, paddingBottom: 128 }}>
        <View style={{ paddingHorizontal: 20, marginBottom: 22 }}>
          <Text style={{ color: theme.inkMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 6 }}>Profile</Text>
          <SerifText style={{ color: theme.ink, fontSize: 38, lineHeight: 40, letterSpacing: -0.5 }}>Garden settings,{`\n`}kept <SerifText style={{ color: theme.primary, fontSize: 38, fontStyle: 'italic' }}>local</SerifText>.</SerifText>
          <Text style={{ color: theme.inkSoft, fontSize: 14, lineHeight: 21, marginTop: 12 }}>Edit the garden profile created during onboarding. Account, sync, and reminders can come later.</Text>
        </View>

        {!editing ? (
          <View style={{ marginHorizontal: 20, borderRadius: 20, backgroundColor: theme.surface, borderWidth: 0.5, borderColor: theme.line, padding: 18 }}>
            <Text style={{ color: theme.inkMuted, fontSize: 10, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 5 }}>Garden profile</Text>
            <SerifText style={{ color: theme.ink, fontSize: 30, lineHeight: 34 }}>{setup.name}</SerifText>
            <Text style={{ color: theme.inkSoft, fontSize: 14, marginTop: 4 }}>{setup.locationLabel}</Text>
            <View style={{ borderTopWidth: 0.5, borderTopColor: theme.line, marginTop: 16, paddingTop: 14, flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
              {rows.map((row) => <SummaryRow key={row.label} label={row.label} value={row.value} />)}
            </View>
            <Pressable onPress={beginEdit} style={{ marginTop: 18, borderRadius: 999, backgroundColor: theme.primary, paddingVertical: 12, alignItems: 'center' }}>
              <Text style={{ color: theme.bg, fontSize: 13, fontWeight: '800' }}>Edit garden setup</Text>
            </Pressable>
          </View>
        ) : draft ? (
          <View style={{ marginHorizontal: 20, gap: 16 }}>
            <EditCard title="Garden">
              <FieldLabel>Garden name</FieldLabel>
              <TextInput value={draft.name} onChangeText={(name) => set({ name })} placeholder="Back Garden" placeholderTextColor={theme.inkMuted} style={inputStyle} />
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 10 }}>
                {gardenNameSuggestions.map((name) => <Pill key={name} label={name} active={draft.name === name} onPress={() => set({ name })} />)}
              </View>
            </EditCard>

            <EditCard title="Location and climate">
              <FieldLabel>Location</FieldLabel>
              <TextInput value={draft.locationLabel} onChangeText={(locationLabel) => set({ locationLabel, locationSource: 'manual', latitude: null, longitude: null })} placeholder="Jersey City, NJ" placeholderTextColor={theme.inkMuted} style={inputStyle} />
              <Pressable onPress={detectLocation} disabled={detecting} style={{ marginTop: 10, borderRadius: 999, borderWidth: 1, borderColor: theme.primary, paddingVertical: 10, alignItems: 'center', opacity: detecting ? 0.72 : 1 }}>
                {detecting ? <ActivityIndicator color={theme.primary} /> : <Text style={{ color: theme.primary, fontSize: 12, fontWeight: '800' }}>Use current location</Text>}
              </Pressable>
              {message ? <Text style={{ color: message.startsWith('Could') ? theme.accent : theme.inkMuted, fontSize: 12, lineHeight: 18, marginTop: 8 }}>{message}</Text> : null}
              <FieldLabel style={{ marginTop: 16 }}>Hardiness zone</FieldLabel>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
                {hardinessZones.map((zone) => <Pill key={zone} label={zone} active={(draft.hardinessZone ?? 'Not sure') === zone} onPress={() => set({ hardinessZone: zone === 'Not sure' ? null : zone, hardinessZoneSource: zone === 'Not sure' ? null : 'manual' })} mono />)}
              </View>
            </EditCard>

            <EditCard title="Growing conditions">
              <FieldLabel>Sun exposure</FieldLabel>
              <View style={{ gap: 8 }}>
                {sunExposureOptions.map((option) => <Choice key={option.id} title={option.label} sub={option.sub} active={draft.sunExposure === option.id} onPress={() => set({ sunExposure: option.id })} />)}
              </View>
              <FieldLabel style={{ marginTop: 16 }}>Growing spaces</FieldLabel>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {growingSpaceOptions.map((option) => <Pill key={option.id} label={option.label} active={draft.growingSpaces.includes(option.id)} onPress={() => toggleSpace(option.id)} />)}
              </View>
            </EditCard>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable onPress={() => { setDraft(null); setMessage(null); }} style={{ flex: 1, borderRadius: 15, borderWidth: 0.5, borderColor: theme.line, backgroundColor: theme.surface, paddingVertical: 14, alignItems: 'center' }}>
                <Text style={{ color: theme.ink, fontWeight: '800' }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={save} disabled={!canSaveProfileDraft(draft) || saving} style={{ flex: 1, borderRadius: 15, backgroundColor: canSaveProfileDraft(draft) ? theme.primary : theme.bgSoft, paddingVertical: 14, alignItems: 'center', opacity: saving ? 0.72 : 1 }}>
                {saving ? <ActivityIndicator color={theme.bg} /> : <Text style={{ color: canSaveProfileDraft(draft) ? theme.bg : theme.inkMuted, fontWeight: '800' }}>Save</Text>}
              </Pressable>
            </View>
          </View>
        ) : null}
      </ScrollView>
      <BottomNav />
    </ScreenScaffold>
  );
}

const inputStyle = { backgroundColor: theme.bg, borderRadius: 14, borderWidth: 0.5, borderColor: theme.line, padding: 13, color: theme.ink, fontSize: 16 };

function ProfileStatus({ title, body, action, onAction }: { title: string; body: string; action?: string; onAction?: () => void }) {
  return <ScreenScaffold><View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 }}><SerifText style={{ color: theme.ink, fontSize: 28, fontStyle: 'italic', textAlign: 'center' }}>{title}</SerifText><Text style={{ color: theme.inkMuted, marginTop: 10, textAlign: 'center' }}>{body}</Text>{action ? <Pressable onPress={onAction} style={{ marginTop: 18, borderRadius: 999, backgroundColor: theme.primary, paddingHorizontal: 18, paddingVertical: 12 }}><Text style={{ color: theme.bg, fontWeight: '800' }}>{action}</Text></Pressable> : null}</View><BottomNav /></ScreenScaffold>;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return <View style={{ width: '45%' }}><Text style={{ color: theme.inkMuted, fontSize: 10, letterSpacing: 1.2, fontWeight: '800', textTransform: 'uppercase' }}>{label}</Text><Text numberOfLines={2} style={{ color: theme.ink, fontSize: 13, fontWeight: '700', marginTop: 3 }}>{value}</Text></View>;
}

function EditCard({ title, children }: { title: string; children: React.ReactNode }) {
  return <View style={{ borderRadius: 18, backgroundColor: theme.surface, borderWidth: 0.5, borderColor: theme.line, padding: 16 }}><Text style={{ color: theme.inkMuted, fontSize: 10, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 12 }}>{title}</Text>{children}</View>;
}

function FieldLabel({ children, style }: { children: React.ReactNode; style?: any }) {
  return <Text style={[{ color: theme.inkMuted, fontSize: 10, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 }, style]}>{children}</Text>;
}

function Pill({ label, active, onPress, mono = false }: { label: string; active: boolean; onPress: () => void; mono?: boolean }) {
  return <Pressable onPress={onPress} style={{ paddingVertical: 8, paddingHorizontal: 11, borderRadius: 999, backgroundColor: active ? theme.primary : theme.bg, borderWidth: active ? 0 : 0.5, borderColor: theme.line }}><Text style={{ color: active ? theme.bg : theme.ink, fontSize: mono ? 12 : 12, fontWeight: '700', fontFamily: mono ? 'Courier' : undefined }}>{label}</Text></Pressable>;
}

function Choice({ title, sub, active, onPress }: { title: string; sub: string; active: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={{ padding: 13, borderRadius: 14, backgroundColor: active ? theme.bgSoft : theme.bg, borderWidth: active ? 1.5 : 0.5, borderColor: active ? theme.primary : theme.line }}><Text style={{ color: theme.ink, fontSize: 14, fontWeight: '800' }}>{title}</Text><Text style={{ color: theme.inkSoft, fontSize: 12, marginTop: 1 }}>{sub}</Text></Pressable>;
}
