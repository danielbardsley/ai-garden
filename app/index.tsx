import { Text, View } from 'react-native';

import { careAssistantPlaceholder } from '../src/features/assistant/careAssistantPlaceholder';
import { galleryPlaceholder } from '../src/features/gallery/galleryPlaceholder';
import { permissionsPlaceholder } from '../src/features/permissions/permissionsPlaceholder';
import { plantRecordsPlaceholder } from '../src/features/plants/plantRecordsPlaceholder';
import { apiBasePath, basePath } from '../src/services/platform';

const placeholders = [
  plantRecordsPlaceholder,
  galleryPlaceholder,
  careAssistantPlaceholder,
  permissionsPlaceholder,
];

export default function Home() {
  return (
    <View style={{ gap: 16, padding: 24 }}>
      <View>
        <Text>Garden Roof Deck</Text>
        <Text>Expo React Native bootstrap</Text>
      </View>

      <View>
        <Text>Frontend path: {basePath}</Text>
        <Text>API path: {apiBasePath}</Text>
      </View>

      <View style={{ gap: 8 }}>
        <Text>Future modules</Text>
        {placeholders.map((item) => (
          <View key={item.id}>
            <Text>{item.title}</Text>
            <Text>{item.summary}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
