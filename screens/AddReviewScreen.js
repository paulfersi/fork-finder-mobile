import React from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

export default function AddReviewScreen() {
  return (
    <View style={styles.container}>
      <Text>Add a Review</Text>
      <TextInput style={styles.input} />
      <TextInput style={styles.input} keyboardType="numeric" />
      <Button title="Submit" onPress={() => alert('Submitted')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    borderBottomWidth: 1,
    marginBottom: 16,
    padding: 8,
  },
});
