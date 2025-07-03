import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function AddReviewScreen() {
  const [restaurantId, setRestaurantId] = useState('');
  const [reviewBody, setReviewBody] = useState('');
  const [rating, setRating] = useState('');
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const getUserId = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        setUserId(data.user.id);
      } else {
        Alert.alert('Error', 'You must be logged in');
      }
    };

    getUserId();
  }, []);

  const handleSubmit = async () => {
    if (!restaurantId || !reviewBody || !rating) {
      Alert.alert('Please fill all fields');
      return;
    }

    const numericRating = parseInt(rating, 10);
    if (numericRating < 1 || numericRating > 5) {
      Alert.alert('Rating must be between 1 and 5');
      return;
    }

    const { error } = await supabase.from('reviews').insert([
      {
        user_id: userId,
        restaurant_id: restaurantId,
        body: reviewBody,
        rating: numericRating,
      },
    ]);

    if (error) {
      Alert.alert('Error saving review', error.message);
    } else {
      Alert.alert('Review submitted!');
      setRestaurantId('');
      setReviewBody('');
      setRating('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add a Review</Text>
      <TextInput
        style={styles.input}
        placeholder="Restaurant ID"
        value={restaurantId}
        onChangeText={setRestaurantId}
      />
      <TextInput
        style={styles.input}
        placeholder="Your review"
        value={reviewBody}
        onChangeText={setReviewBody}
        multiline
      />
      <TextInput
        style={styles.input}
        placeholder="Rating (1–5)"
        value={rating}
        onChangeText={setRating}
        keyboardType="numeric"
      />
      <Button title="Submit Review" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 20, marginBottom: 20 },
  input: {
    borderBottomWidth: 1,
    paddingVertical: 8,
    marginBottom: 16,
    backgroundColor:"#722F37",
  },
});
