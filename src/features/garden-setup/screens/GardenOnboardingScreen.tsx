import { ReactNode, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { PhotoTreatment, ScreenScaffold, SerifText } from '../../garden-design/components/primitives';
import { theme } from '../../garden-design/theme';
import { SaveGardenSetupInput, SunExposure } from '../models/GardenSetup';
import { gardenGlyphs, gardenNameSuggestions, growingSpaceOptions, hardinessZones, sunExposureOptions } from '../onboardingOptions';

type OnboardingDraft = SaveGardenSetupInput;
type StepId = 'welcome' | 'identity' | 'place' | 'setup' | 'ready';

const steps: { id: StepId; eyebrow: string }[] = [
  { id: 'welcome', eyebrow: 'Folio · No. 001' },
  { id: 'identity', eyebrow: 'Step 1 of 4' },
  { id: 'place', eyebrow: 'Step 2 of 4' },
  { id: 'setup', eyebrow: 'Step 3 of 4' },
  { id: 'ready', eyebrow: 'Step 4 of 4' },
];

const initialDraft: OnboardingDraft = {
  name: '',
  glyph: 'Gd',
  locationLabel: '',
  hardinessZone: null,
  sunExposure: 'partial',
  growingSpaces: [],
};

export function GardenOnboardingScreen({ onComplete }: { onComplete: (input: SaveGardenSetupInput) => Promise<void> }) {
  const [index, setIndex] = useState(0);
  const [draft, setDraft] = useState<OnboardingDraft>(initialDraft);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const step = steps[index];

  const canAdvance = useMemo(() => {
    if (step.id === 'identity') return draft.name.trim().length > 0;
    if (step.id === 'place') return draft.locationLabel.trim().length > 0;
    return true;
  }, [draft.locationLabel, draft.name, step.id]);

  const set = (patch: Partial<OnboardingDraft>) => setDraft((current) => ({ ...current, ...patch }));
  const toggleSpace = (id: string) => setDraft((current) => ({
    ...current,
    growingSpaces: current.growingSpaces.includes(id) ? current.growingSpaces.filter((item) => item !== id) : [...current.growingSpaces, id],
  }));

  const next = async () => {
    if (!canAdvance || saving) return;
    setError(null);
    if (index < steps.length - 1) {
      setIndex((current) => current + 1);
      return;
    }
    try {
      setSaving(true);
      await onComplete(draft);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save garden setup.');
      setSaving(false);
    }
  };

  return (
    <ScreenScaffold bottomInset={0}>
      <View style={{ flex: 1 }}>
        <View style={{ paddingTop: 54, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {steps.map((item, itemIndex) => (
              <View key={item.id} style={{ width: itemIndex === index ? 22 : 6, height: 6, borderRadius: 999, backgroundColor: itemIndex <= index ? theme.primary : theme.line }} />
            ))}
          </View>
          <Text style={{ color: theme.inkMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase' }}>Setup</Text>
        </View>

        <ScrollView contentContainerStyle={{ paddingTop: 24, paddingBottom: 112 }}>
          {step.id === 'welcome' ? <WelcomeStep /> : null}
          {step.id === 'identity' ? <IdentityStep draft={draft} set={set} /> : null}
          {step.id === 'place' ? <PlaceStep draft={draft} set={set} /> : null}
          {step.id === 'setup' ? <SetupStep draft={draft} toggleSpace={toggleSpace} /> : null}
          {step.id === 'ready' ? <ReadyStep draft={draft} /> : null}
          {error ? <Text style={{ color: theme.accent, marginHorizontal: 28, marginTop: 16 }}>{error}</Text> : null}
        </ScrollView>

        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 36, backgroundColor: theme.bg, flexDirection: 'row', gap: 10 }}>
          {index > 0 ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => setIndex((current) => Math.max(0, current - 1))} style={{ width: 52, height: 52, borderRadius: 16, borderWidth: 0.5, borderColor: theme.line, backgroundColor: theme.surface, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: theme.ink, fontSize: 28, lineHeight: 30 }}>‹</Text>
            </Pressable>
          ) : <View style={{ width: 52 }} />}
          <Pressable accessibilityRole="button" accessibilityLabel={index === steps.length - 1 ? 'Open the garden' : 'Continue'} onPress={next} disabled={!canAdvance || saving} style={{ flex: 1, height: 52, borderRadius: 16, backgroundColor: canAdvance ? theme.primary : theme.bgSoft, alignItems: 'center', justifyContent: 'center', opacity: saving ? 0.72 : 1 }}>
            {saving ? <ActivityIndicator color={theme.bg} /> : <Text style={{ color: canAdvance ? theme.bg : theme.inkMuted, fontSize: 15, fontWeight: '800' }}>{index === 0 ? 'Start your garden' : index === steps.length - 1 ? 'Open the garden' : 'Continue'}</Text>}
          </Pressable>
        </View>
      </View>
    </ScreenScaffold>
  );
}

function StepHeading({ eyebrow, title, sub }: { eyebrow: string; title: ReactNode; sub: string }) {
  return <View><Text style={{ color: theme.inkMuted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>{eyebrow}</Text><SerifText style={{ color: theme.ink, fontSize: 32, lineHeight: 35, letterSpacing: -0.5 }}>{title}</SerifText><Text style={{ color: theme.inkSoft, marginTop: 10, fontSize: 14, lineHeight: 21 }}>{sub}</Text></View>;
}

function WelcomeStep() {
  return <View style={{ paddingHorizontal: 28 }}><View style={{ height: 260, borderRadius: 22, overflow: 'hidden', backgroundColor: theme.leaf2, marginBottom: 32, borderWidth: 0.5, borderColor: theme.line }}><PhotoTreatment tone={theme.primary} glyph="leaf" style={{ flex: 1 }} radius={22} /><Text style={{ position: 'absolute', top: 16, left: 18, color: 'rgba(255,255,255,0.86)', fontSize: 10, fontWeight: '800', letterSpacing: 1.4, textTransform: 'uppercase' }}>No. 001 · folio</Text><SerifText style={{ position: 'absolute', right: 18, bottom: 16, color: 'rgba(255,255,255,0.92)', fontSize: 14, fontStyle: 'italic' }}>specimen — leaf</SerifText></View><Text style={{ color: theme.inkMuted, fontSize: 11, fontWeight: '800', letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 8 }}>A field journal · for things you grow</Text><SerifText style={{ color: theme.ink, fontSize: 40, lineHeight: 42, letterSpacing: -0.6 }}>Plant something,{`\n`}<SerifText style={{ color: theme.primary, fontSize: 40, fontStyle: 'italic' }}>watch it remember.</SerifText></SerifText><Text style={{ color: theme.inkSoft, fontSize: 15, lineHeight: 23, marginTop: 14 }}>Set up a garden for your back garden, patio, balcony, roof deck, allotment, greenhouse, or windowsill. Garden keeps the weeks, the weather, and the quiet small wins.</Text><View style={{ marginTop: 24, backgroundColor: theme.surface, borderRadius: 16, borderWidth: 0.5, borderColor: theme.line, padding: 14, gap: 12 }}>{[['▧', 'Identify and save photos', 'Point your camera, get a useful record.'], ['⌁', 'A timeline per plant', 'Photos and notes stack over seasons.'], ['✦', 'Gentle nudges only', 'Care prompts should help, not nag.']].map(([icon, title, sub]) => <View key={title} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}><View style={{ width: 30, height: 30, borderRadius: 9, backgroundColor: theme.bgSoft, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: theme.primary, fontWeight: '800' }}>{icon}</Text></View><View style={{ flex: 1 }}><Text style={{ color: theme.ink, fontSize: 14, fontWeight: '700' }}>{title}</Text><Text style={{ color: theme.inkSoft, fontSize: 12, marginTop: 1 }}>{sub}</Text></View></View>)}</View></View>;
}

function IdentityStep({ draft, set }: { draft: OnboardingDraft; set: (patch: Partial<OnboardingDraft>) => void }) {
  return <View style={{ paddingHorizontal: 28 }}><StepHeading eyebrow="Step 1 of 4" title={<>What should we <SerifText style={{ color: theme.primary, fontSize: 32, fontStyle: 'italic' }}>call</SerifText> it?</>} sub="The name shows up on your home screen and in future garden notes. You can change it later." /><View style={{ marginVertical: 22, padding: 14, backgroundColor: theme.surface, borderRadius: 16, borderWidth: 0.5, borderColor: theme.line, flexDirection: 'row', alignItems: 'center', gap: 12 }}><PhotoTreatment tone={theme.primary} glyph={draft.glyph ?? undefined} style={{ width: 44, height: 44 }} radius={12} /><View style={{ flex: 1 }}><SerifText numberOfLines={1} style={{ color: theme.ink, fontSize: 19, fontStyle: 'italic' }}>{draft.name || 'Untitled garden'}</SerifText><Text style={{ color: theme.inkMuted, fontSize: 10, letterSpacing: 0.8, marginTop: 4 }}>EST. {new Date().getFullYear()} · 0 plants</Text></View></View><Text style={{ color: theme.inkMuted, fontSize: 10, fontWeight: '800', letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 8 }}>Garden name</Text><TextInput autoFocus value={draft.name} onChangeText={(name) => set({ name })} placeholder="e.g. Back Garden" maxLength={28} placeholderTextColor={theme.inkMuted} style={{ backgroundColor: theme.surface, borderRadius: 14, borderWidth: 0.5, borderColor: theme.line, padding: 14, color: theme.ink, fontSize: 22, fontFamily: 'Georgia', fontStyle: 'italic' }} /><Text style={{ color: theme.inkMuted, fontSize: 11, marginTop: 6 }}>{draft.name.length}/28 · {draft.name.trim() ? 'ready' : 'a name helps memories stick'}</Text><Text style={{ color: theme.inkMuted, fontSize: 10, fontWeight: '800', letterSpacing: 1.4, textTransform: 'uppercase', marginTop: 22, marginBottom: 10 }}>Or borrow one</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>{gardenNameSuggestions.map((name) => <Pill key={name} label={name} active={draft.name === name} onPress={() => set({ name })} />)}</View><Text style={{ color: theme.inkMuted, fontSize: 10, fontWeight: '800', letterSpacing: 1.4, textTransform: 'uppercase', marginTop: 24, marginBottom: 10 }}>Specimen stamp</Text><View style={{ flexDirection: 'row', gap: 8 }}>{gardenGlyphs.map((glyph) => <Pressable key={glyph} onPress={() => set({ glyph })} style={{ width: 44, height: 44, borderRadius: 12, borderWidth: draft.glyph === glyph ? 1.5 : 0.5, borderColor: draft.glyph === glyph ? theme.primary : theme.line, backgroundColor: theme.surface, alignItems: 'center', justifyContent: 'center' }}><SerifText style={{ color: theme.ink, fontSize: 16, fontStyle: 'italic' }}>{glyph}</SerifText></Pressable>)}</View></View>;
}

function PlaceStep({ draft, set }: { draft: OnboardingDraft; set: (patch: Partial<OnboardingDraft>) => void }) {
  return <View style={{ paddingHorizontal: 28 }}><StepHeading eyebrow="Step 2 of 4" title={<>Where is the <SerifText style={{ color: theme.primary, fontSize: 32, fontStyle: 'italic' }}>garden</SerifText>?</>} sub="A rough location and sun pattern helps weather context, AI care notes, and future reminders." /><Text style={{ color: theme.inkMuted, fontSize: 10, fontWeight: '800', letterSpacing: 1.4, textTransform: 'uppercase', marginTop: 22, marginBottom: 8 }}>City, postcode, or place</Text><TextInput value={draft.locationLabel} onChangeText={(locationLabel) => set({ locationLabel })} placeholder="Brooklyn, NY" placeholderTextColor={theme.inkMuted} style={{ backgroundColor: theme.surface, borderRadius: 14, borderWidth: 0.5, borderColor: theme.line, padding: 14, color: theme.ink, fontSize: 16 }} /><View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 22, marginBottom: 10 }}><Text style={{ color: theme.inkMuted, fontSize: 10, fontWeight: '800', letterSpacing: 1.4, textTransform: 'uppercase' }}>Hardiness zone</Text><SerifText style={{ color: theme.inkSoft, fontSize: 12, fontStyle: 'italic' }}>manual for now</SerifText></View><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 7 }}>{hardinessZones.map((zone) => <Pill key={zone} label={zone} active={(draft.hardinessZone ?? 'Not sure') === zone} onPress={() => set({ hardinessZone: zone === 'Not sure' ? null : zone })} mono />)}</ScrollView><Text style={{ color: theme.inkMuted, fontSize: 10, fontWeight: '800', letterSpacing: 1.4, textTransform: 'uppercase', marginTop: 22, marginBottom: 10 }}>Daily sun</Text><View style={{ gap: 8 }}>{sunExposureOptions.map((option) => <ChoiceRow key={option.id} title={option.label} sub={option.sub} mark={option.mark} active={draft.sunExposure === option.id} onPress={() => set({ sunExposure: option.id as SunExposure })} />)}</View></View>;
}

function SetupStep({ draft, toggleSpace }: { draft: OnboardingDraft; toggleSpace: (id: string) => void }) {
  return <View style={{ paddingHorizontal: 28 }}><StepHeading eyebrow="Step 3 of 4" title={<>What are you <SerifText style={{ color: theme.primary, fontSize: 32, fontStyle: 'italic' }}>growing</SerifText> in?</>} sub="Pick any number. This works for back gardens, containers, balconies, allotments, and indoor growing." /><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 22 }}>{growingSpaceOptions.map((option) => { const active = draft.growingSpaces.includes(option.id); return <Pressable key={option.id} accessibilityRole="button" accessibilityLabel={option.label} onPress={() => toggleSpace(option.id)} style={{ width: '48%', minHeight: 132, borderRadius: 16, padding: 12, backgroundColor: theme.surface, borderWidth: active ? 1.5 : 0.5, borderColor: active ? theme.primary : theme.line }}><PhotoTreatment tone={active ? theme.primary : theme.leaf3} glyph={option.glyph} style={{ height: 56, marginBottom: 10 }} radius={10} /><Text style={{ color: theme.ink, fontSize: 13, fontWeight: '800', lineHeight: 16 }}>{option.label}</Text><Text style={{ color: theme.inkSoft, fontSize: 11, lineHeight: 15, marginTop: 4 }}>{option.sub}</Text>{active ? <Text style={{ position: 'absolute', right: 10, top: 8, color: theme.primary, fontSize: 16, fontWeight: '800' }}>✓</Text> : null}</Pressable>; })}</View><SerifText style={{ color: theme.inkMuted, textAlign: 'center', fontSize: 13, fontStyle: 'italic', marginTop: 16 }}>{draft.growingSpaces.length ? `${draft.growingSpaces.length} spaces chosen` : 'You can start without choosing one.'}</SerifText></View>;
}

function ReadyStep({ draft }: { draft: OnboardingDraft }) {
  const exposure = sunExposureOptions.find((option) => option.id === draft.sunExposure)?.label ?? 'Not sure';
  const spaceLabels = draft.growingSpaces.map((id) => growingSpaceOptions.find((option) => option.id === id)?.label ?? id);
  return <View style={{ paddingHorizontal: 28 }}><View style={{ padding: 22, backgroundColor: theme.surface, borderRadius: 22, borderWidth: 0.5, borderColor: theme.line, overflow: 'hidden' }}><Text style={{ color: theme.inkMuted, fontSize: 9, letterSpacing: 1.6, fontWeight: '800', textTransform: 'uppercase' }}>Folio · No. 001</Text><SerifText style={{ color: theme.ink, fontSize: 30, lineHeight: 34, marginTop: 10 }}>{draft.name || 'Untitled garden'}</SerifText><SerifText style={{ color: theme.inkSoft, fontSize: 14, fontStyle: 'italic', marginTop: 4, marginBottom: 18 }}>{draft.locationLabel || 'Somewhere green'} · est. {new Date().getFullYear()}</SerifText><View style={{ borderTopWidth: 0.5, borderTopColor: theme.line, paddingTop: 14, flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}><Recap label="Zone" value={draft.hardinessZone ? `USDA ${draft.hardinessZone}` : 'Not sure'} /><Recap label="Sun" value={exposure} /><Recap label="Spaces" value={spaceLabels.length ? spaceLabels.slice(0, 2).join(', ') + (spaceLabels.length > 2 ? ` +${spaceLabels.length - 2}` : '') : 'Add later'} /><Recap label="Next" value="Add first plant" /></View></View><SerifText style={{ color: theme.ink, fontSize: 28, lineHeight: 31, marginTop: 28 }}>You're <SerifText style={{ color: theme.primary, fontSize: 28, fontStyle: 'italic' }}>ready</SerifText>.</SerifText><Text style={{ color: theme.inkSoft, fontSize: 14, lineHeight: 21, marginTop: 8 }}>We'll open your home screen next. From there, use the camera button or first-plant prompt to start building the garden record.</Text><View style={{ marginTop: 18, backgroundColor: theme.bgSoft, borderRadius: 14, padding: 14, flexDirection: 'row', gap: 12 }}><View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: theme.bg, fontWeight: '800' }}>✦</Text></View><View style={{ flex: 1 }}><Text style={{ color: theme.ink, fontSize: 13, fontWeight: '800' }}>Tip · the rhythm</Text><Text style={{ color: theme.inkSoft, fontSize: 12, lineHeight: 18, marginTop: 2 }}>One photo, once a week, same angle. A year from now you'll see something you can't see today.</Text></View></View></View>;
}

function Recap({ label, value }: { label: string; value: string }) {
  return <View style={{ width: '45%' }}><Text style={{ color: theme.inkMuted, fontSize: 10, letterSpacing: 1.2, fontWeight: '800', textTransform: 'uppercase' }}>{label}</Text><Text numberOfLines={1} style={{ color: theme.ink, fontSize: 13, fontWeight: '700', marginTop: 3 }}>{value}</Text></View>;
}

function ChoiceRow({ title, sub, mark, active, onPress }: { title: string; sub: string; mark: string; active: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={{ padding: 14, borderRadius: 14, backgroundColor: theme.surface, borderWidth: active ? 1.5 : 0.5, borderColor: active ? theme.primary : theme.line, flexDirection: 'row', alignItems: 'center', gap: 14 }}><View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: theme.bgSoft, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: theme.primary, fontSize: 18 }}>{mark}</Text></View><View style={{ flex: 1 }}><Text style={{ color: theme.ink, fontSize: 15, fontWeight: '800' }}>{title}</Text><Text style={{ color: theme.inkSoft, fontSize: 12, marginTop: 1 }}>{sub}</Text></View><View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: active ? theme.primary : theme.line, backgroundColor: active ? theme.primary : 'transparent' }} /></Pressable>;
}

function Pill({ label, active, onPress, mono = false }: { label: string; active: boolean; onPress: () => void; mono?: boolean }) {
  return <Pressable onPress={onPress} style={{ paddingVertical: 8, paddingHorizontal: 13, borderRadius: 999, backgroundColor: active ? theme.primary : theme.surface, borderWidth: active ? 0 : 0.5, borderColor: theme.line }}><Text style={{ color: active ? theme.bg : theme.ink, fontSize: mono ? 12 : 13, fontWeight: '700', fontFamily: mono ? 'Courier' : undefined }}>{label}</Text></Pressable>;
}
