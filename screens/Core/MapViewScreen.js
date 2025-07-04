import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function MapViewScreen({ route }) {
  const { name, latitude, longitude } = route.params;

  return (
    <View style={styles.container}>
      {latitude && longitude ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker
            coordinate={{
              latitude: parseFloat(latitude),
              longitude: parseFloat(longitude),
            }}
            title={name}
          />
        </MapView>
      ) : (
        <Text style={styles.error}>No location available</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  error: { flex: 1, justifyContent: 'center', textAlign: 'center', padding: 20 },
});
