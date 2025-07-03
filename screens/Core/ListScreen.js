import React from 'react';
import { View, Text, StyleSheet,Button } from 'react-native';

export default function ListScreen( {navigation }) {
  return (
    <View style={styles.container}>
      <Text>List of Posts (coming soon)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
