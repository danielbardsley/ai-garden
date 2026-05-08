import { usePathname, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { GlyphIcon } from './primitives';
import { theme } from '../theme';

function tabColor(active: boolean) {
  return active ? theme.primary : theme.inkMuted;
}

export function BottomNav() {
  const router = useRouter();
  const path = usePathname();
  const isHome = path === '/';
  const isGallery = path.startsWith('/gallery');

  const Tab = ({ label, icon, active, onPress }: { label: string; icon: string; active: boolean; onPress: () => void }) => (
    <Pressable onPress={onPress} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 }}>
      <GlyphIcon name={icon} color={tabColor(active)} size={20} />
      <Text style={{ color: tabColor(active), fontSize: 10, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );

  return (
    <View
      style={{
        position: 'absolute',
        left: 14,
        right: 14,
        bottom: 18,
        height: 66,
        borderRadius: 34,
        backgroundColor: theme.name === 'Forest' ? 'rgba(40,56,50,0.92)' : 'rgba(255,253,247,0.92)',
        borderWidth: 0.5,
        borderColor: theme.line,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 5,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 8 },
        elevation: 8,
      }}
    >
      <Tab label="Garden" icon="home" active={isHome} onPress={() => router.push('/')} />
      <Tab label="Gallery" icon="gallery" active={isGallery} onPress={() => router.push('/gallery')} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Capture"
        onPress={() => router.push('/camera')}
        style={{
          width: 58,
          height: 58,
          borderRadius: 29,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.primary,
          marginHorizontal: 4,
          shadowColor: theme.primary,
          shadowOpacity: 0.35,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 6 },
        }}
      >
        <GlyphIcon name="camera" color={theme.bg} size={24} />
      </Pressable>
      <Tab label="Reminders" icon="chat" active={false} onPress={() => undefined} />
      <Tab label="Profile" icon="profile" active={false} onPress={() => undefined} />
    </View>
  );
}
