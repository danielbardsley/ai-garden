import { Image, Pressable, StyleProp, Text, View, ViewStyle } from 'react-native';

import { GardenTheme, theme as defaultTheme } from '../theme';

export function ScreenScaffold({ children, bottomInset = 96, theme = defaultTheme }: { children: React.ReactNode; bottomInset?: number; theme?: GardenTheme }) {
  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <View
        style={{
          position: 'absolute',
          left: -90,
          top: -90,
          width: 220,
          height: 220,
          borderRadius: 110,
          backgroundColor: theme.paperGrain,
        }}
      />
      <View
        style={{
          position: 'absolute',
          right: -110,
          bottom: 40,
          width: 260,
          height: 260,
          borderRadius: 130,
          backgroundColor: theme.name === 'Forest' ? 'rgba(232,168,124,0.045)' : 'rgba(200,100,61,0.07)',
        }}
      />
      <View style={{ flex: 1, paddingBottom: bottomInset }}>{children}</View>
    </View>
  );
}

export function PhotoTreatment({
  tone = '#7da259',
  glyph,
  date,
  imageUri,
  style,
  radius = 16,
}: {
  tone?: string;
  glyph?: string;
  date?: string;
  imageUri?: string | null;
  style?: StyleProp<ViewStyle>;
  radius?: number;
}) {
  return (
    <View style={[{ overflow: 'hidden', borderRadius: radius, backgroundColor: tone }, style]}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} resizeMode="cover" style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }} />
      ) : (
        <>
          <View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: tone }} />
          <View
            style={{
              position: 'absolute',
              right: -26,
              top: 12,
              width: 112,
              height: 70,
              borderRadius: 60,
              backgroundColor: 'rgba(35,41,31,0.23)',
              transform: [{ rotate: '-24deg' }],
            }}
          />
          <View
            style={{
              position: 'absolute',
              left: -34,
              bottom: -10,
              width: 130,
              height: 82,
              borderRadius: 70,
              backgroundColor: 'rgba(255,255,255,0.16)',
              transform: [{ rotate: '18deg' }],
            }}
          />
          <View
            style={{
              position: 'absolute',
              left: '42%',
              top: '44%',
              width: 62,
              height: 34,
              borderRadius: 34,
              backgroundColor: 'rgba(35,41,31,0.12)',
              transform: [{ rotate: '-40deg' }],
            }}
          />
        </>
      )}
      {(glyph || date) && (
        <View style={{ position: 'absolute', left: 9, right: 9, bottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          {date ? <MonoText style={{ color: 'rgba(255,255,255,0.94)', fontSize: 10 }}>{date}</MonoText> : <View />}
          {glyph ? <SerifText style={{ color: 'rgba(255,255,255,0.86)', fontSize: 14, fontStyle: 'italic' }}>{glyph}</SerifText> : null}
        </View>
      )}
    </View>
  );
}

export function SerifText({ children, style, numberOfLines }: { children: React.ReactNode; style?: any; numberOfLines?: number }) {
  return <Text numberOfLines={numberOfLines} style={[{ fontFamily: 'Georgia', color: '#23291f' }, style]}>{children}</Text>;
}

export function MonoText({ children, style }: { children: React.ReactNode; style?: any }) {
  return <Text style={[{ fontFamily: 'Courier', color: '#9aa394' }, style]}>{children}</Text>;
}

export function StatusDot({ kind, theme }: { kind: 'good' | 'warn' | 'idle'; theme: GardenTheme }) {
  const color = kind === 'warn' ? theme.accent : kind === 'idle' ? theme.inkMuted : theme.primary;
  return <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: color, marginRight: 6 }} />;
}

export function SectionHeader({ title, action, theme }: { title: string; action?: string; theme: GardenTheme }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 10 }}>
      <SerifText style={{ fontSize: 20, fontWeight: '500', fontStyle: 'italic', color: theme.ink }}>{title}</SerifText>
      {action ? <Text style={{ color: theme.inkSoft, fontSize: 12, fontWeight: '600' }}>{action}</Text> : null}
    </View>
  );
}

export function IconButton({ label, onPress, dark = false, theme, children }: { label: string; onPress?: () => void; dark?: boolean; theme: GardenTheme; children: React.ReactNode }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: dark ? 'rgba(255,255,255,0.18)' : theme.name === 'Forest' ? 'rgba(50,66,57,0.92)' : 'rgba(255,253,247,0.78)',
        borderWidth: 0.5,
        borderColor: dark ? 'rgba(255,255,255,0.22)' : theme.line,
      }}
    >
      {children}
    </Pressable>
  );
}

export function GlyphIcon({ name, color = '#23291f', size = 20 }: { name: string; color?: string; size?: number }) {
  const map: Record<string, string> = {
    home: '⌂',
    gallery: '▧',
    camera: '◉',
    chat: '☏',
    profile: '♙',
    close: '×',
    back: '‹',
    sparkle: '✦',
    leaf: '⌁',
    send: '➤',
  };
  return <Text style={{ color, fontSize: size, lineHeight: size + 2, fontWeight: '700' }}>{map[name] ?? '•'}</Text>;
}

export function Chip({ label, active, onPress, theme, swatch }: { label: string; active: boolean; onPress: () => void; theme: GardenTheme; swatch?: string }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        borderRadius: 999,
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: active ? theme.ink : theme.surface,
        borderWidth: active ? 0 : 0.5,
        borderColor: theme.line,
      }}
    >
      {swatch ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: swatch }} /> : null}
      <Text style={{ color: active ? theme.bg : theme.inkSoft, fontSize: 12, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}
