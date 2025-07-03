import React, { useEffect, useState } from 'react';
import {View,Text,TextInput,Button,StyleSheet,Alert,FlatList,TouchableOpacity} from 'react-native';
import { supabase } from '../../lib/supabase';
import Constants from 'expo-constants';

const mapboxToken = Constants.expoConfig.extra.mapboxToken;

export default function AddReviewScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [reviewBody, setReviewBody] = useState('');
  const [rating, setRating] = useState('');
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const getUserId = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUserId(data.user.id);
    };
    getUserId();
  }, []);

  const handleSearch = async () => {
    const bboxEurope = '-23.958156,31.052934,44.830131,71.185989';
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      query
    )}.json?access_token=${mapboxToken}&bbox=${bboxEurope}&limit=3`;

    try {
      const res = await fetch(url);
      const json = await res.json();
      setResults(json.features || []);
    } catch (err) {
      console.error('Mapbox fetch error:', err);
      Alert.alert('Failed to search');
    }
  };

  const selectPlace = async (place) => {
    const { id: place_id, text: name, place_name: address, center } = place;
    const [longitude, latitude] = center;

    const { data, error } = await supabase
      .from('restaurants')
      .upsert(
        {
          place_id,
          name,
          address,
          latitude: latitude.toString(),
          longitude: longitude.toString(),
        },
        { onConflict: 'place_id' }
      )
      .select()
      .single();

    if (error) {
      Alert.alert('Error saving restaurant', error.message);
    } else {
      setSelectedPlace({ ...data });
      setResults([]); // hide list
    }
  };

  const submitReview = async () => {
    if (!selectedPlace || !reviewBody || !rating) {
      Alert.alert('All fields are required');
      return;
    }

    const numericRating = parseInt(rating);
    if (numericRating < 1 || numericRating > 5) {
      Alert.alert('Rating must be 1–5');
      return;
    }

    const { error } = await supabase.from('reviews').insert([
      {
        user_id: userId,
        restaurant_id: selectedPlace.id,
        body: reviewBody,
        rating: numericRating,
      },
    ]);

    if (error) {
      Alert.alert('Error submitting review', error.message);
    } else {
      Alert.alert('Review submitted!');
      setReviewBody('');
      setRating('');
      setSelectedPlace(null);
      setQuery('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add a Review</Text>

      <TextInput
        style={styles.input}
        placeholder="Search for a restaurant"
        value={query}
        onChangeText={setQuery}
      />
      <Button title="Search" onPress={handleSearch} />

      {results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => selectPlace(item)} style={styles.resultItem}>
              <Text>{item.text}</Text>
              <Text style={styles.subtext}>{item.place_name}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {selectedPlace && (
        <View style={styles.selected}>
          <Text style={styles.label}>Selected:</Text>
          <Text>{selectedPlace.name}</Text>
          <Text>{selectedPlace.address}</Text>
        </View>
      )}

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

      <Button title="Submit Review" onPress={submitReview} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, marginBottom: 16 },
  input: {
    borderBottomWidth: 1,
    paddingVertical: 8,
    marginBottom: 12,
    backgroundColor: "#722F37"
  },
  resultItem: {
    padding: 10,
    borderBottomWidth: 0.5,
  },
  subtext: {
    fontSize: 12,
    color: 'gray',
  },
  selected: {
    marginVertical: 16,
    padding: 10,
    backgroundColor: '#f2f2f2',
  },
  label: {
    fontWeight: 'bold',
  },
});
