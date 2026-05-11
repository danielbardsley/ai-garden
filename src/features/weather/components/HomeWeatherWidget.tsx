import { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { GlyphIcon, SerifText } from '../../garden-design/components/primitives';
import { theme } from '../../garden-design/theme';
import { GardenZone } from '../models/GardenZone';
import { WeatherWidgetState } from '../models/WeatherWidgetState';
import { WeatherWidgetService } from '../services/WeatherWidgetService';
import { gardenWeekLabel } from '../viewModels/gardenWeekLabel';
import { setupZoneValue } from '../viewModels/setupZone';
import { weatherWidgetCopy } from '../viewModels/weatherWidgetCopy';

export function HomeWeatherWidget({ gardenCreatedAt, setupZone }: { gardenCreatedAt?: string | null; setupZone?: string | null } = {}) {
  const service = useMemo(() => new WeatherWidgetService(), []);
  const resolvedSetupZone = setupZoneValue(setupZone);
  const [state, setState] = useState<WeatherWidgetState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    service.load().then((nextState) => {
      if (!cancelled) setState(nextState);
    });
    return () => {
      cancelled = true;
    };
  }, [service]);

  const copy = weatherWidgetCopy(state.status === 'loading' && resolvedSetupZone ? { status: 'ready', data: { zone: resolvedSetupZone, cached: false, fetchedAt: new Date().toISOString() } } : applySetupZone(state, resolvedSetupZone));

  return (
    <View style={{ marginHorizontal: 20, marginBottom: 24, padding: 15, backgroundColor: theme.surface, borderRadius: 18, borderWidth: 0.5, borderColor: theme.line, flexDirection: 'row', alignItems: 'center', gap: 13 }}>
      <View style={{ width: 40, height: 40, borderRadius: 13, backgroundColor: theme.leaf3, alignItems: 'center', justifyContent: 'center' }}>
        <GlyphIcon name="leaf" color={theme.primaryDeep} size={20} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: theme.ink, fontSize: 15, fontWeight: '600' }}>{copy.primaryLine}</Text>
        <Text style={{ color: theme.inkSoft, fontSize: 12, marginTop: 2 }}>{copy.secondaryLine}</Text>
      </View>
      <SerifText style={{ color: theme.inkSoft, fontSize: 14, fontStyle: 'italic' }}>{gardenWeekLabel(gardenCreatedAt)}</SerifText>
    </View>
  );
}

export function applySetupZone(state: WeatherWidgetState, zone?: GardenZone): WeatherWidgetState {
  if (!zone || state.status !== 'ready' || !state.data) return state;
  return {
    ...state,
    data: {
      ...state.data,
      zone,
    },
  };
}
