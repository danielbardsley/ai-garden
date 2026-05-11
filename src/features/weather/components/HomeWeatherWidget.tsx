import { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { GlyphIcon, SerifText } from '../../garden-design/components/primitives';
import { theme } from '../../garden-design/theme';
import { WeatherWidgetState } from '../models/WeatherWidgetState';
import { WeatherWidgetService } from '../services/WeatherWidgetService';
import { weatherWidgetCopy } from '../viewModels/weatherWidgetCopy';

export function HomeWeatherWidget() {
  const service = useMemo(() => new WeatherWidgetService(), []);
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

  const copy = weatherWidgetCopy(state);

  return (
    <View style={{ marginHorizontal: 20, marginBottom: 24, padding: 15, backgroundColor: theme.surface, borderRadius: 18, borderWidth: 0.5, borderColor: theme.line, flexDirection: 'row', alignItems: 'center', gap: 13 }}>
      <View style={{ width: 40, height: 40, borderRadius: 13, backgroundColor: theme.leaf3, alignItems: 'center', justifyContent: 'center' }}>
        <GlyphIcon name="leaf" color={theme.primaryDeep} size={20} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: theme.ink, fontSize: 15, fontWeight: '600' }}>{copy.primaryLine}</Text>
        <Text style={{ color: theme.inkSoft, fontSize: 12, marginTop: 2 }}>{copy.secondaryLine}</Text>
      </View>
      <SerifText style={{ color: theme.inkSoft, fontSize: 14, fontStyle: 'italic' }}>{currentSeasonWeekLabel()}</SerifText>
    </View>
  );
}

export function currentSeasonWeekLabel(date = new Date()): string {
  const start = new Date(date.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86400000) + 1;
  return `week ${Math.ceil(dayOfYear / 7)}`;
}
