import React from 'react';
import { View, Button, StyleSheet } from 'react-native';
import MapboxGL from '@rnmapbox/maps';

export default function MapScreen({ navigation }){
    return (
        <View style={styles.container}>
            <MapBoxGL.MapView style={styles.map}>
                <MapBoxGL.Camera
                    zoomLevel={14}
                    centerCoordinate={[48.866667,2.333333]} //paris
                />
            </MapBoxGL.MapView>
            <Button title="Go to List" onPress={() => navigation.navigate('List')} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    map: {
      flex: 1,
    },
  })