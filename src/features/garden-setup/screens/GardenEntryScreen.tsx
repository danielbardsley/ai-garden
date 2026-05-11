import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { HomeScreen } from '../../garden-design/screens/HomeScreen';
import { ScreenScaffold, SerifText } from '../../garden-design/components/primitives';
import { theme } from '../../garden-design/theme';
import { SaveGardenSetupInput } from '../models/GardenSetup';
import { useGardenSetup } from '../hooks/useGardenSetup';
import { GardenOnboardingScreen } from './GardenOnboardingScreen';

export function GardenEntryScreen() {
  const { setup, loading, error, reload, saveSetup } = useGardenSetup();
  const [completed, setCompleted] = useState(false);

  const completeOnboarding = async (input: SaveGardenSetupInput) => {
    await saveSetup(input);
    setCompleted(true);
  };

  if (loading) {
    return (
      <ScreenScaffold bottomInset={0}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 }}>
          <SerifText style={{ color: theme.ink, fontSize: 28, fontStyle: 'italic', textAlign: 'center' }}>Opening your garden…</SerifText>
          <Text style={{ color: theme.inkMuted, marginTop: 10, textAlign: 'center' }}>Checking local setup.</Text>
        </View>
      </ScreenScaffold>
    );
  }

  if (error) {
    return (
      <ScreenScaffold bottomInset={0}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 }}>
          <SerifText style={{ color: theme.ink, fontSize: 28, fontStyle: 'italic', textAlign: 'center' }}>Setup needs a retry.</SerifText>
          <Text style={{ color: theme.accent, marginTop: 10, textAlign: 'center' }}>{error.message}</Text>
          <Pressable onPress={reload} style={{ marginTop: 18, borderRadius: 999, backgroundColor: theme.primary, paddingHorizontal: 18, paddingVertical: 12 }}>
            <Text style={{ color: theme.bg, fontWeight: '800' }}>Retry</Text>
          </Pressable>
        </View>
      </ScreenScaffold>
    );
  }

  if (!setup) return <GardenOnboardingScreen onComplete={completeOnboarding} />;

  return <HomeScreen gardenSetup={setup} justOnboarded={completed} />;
}
