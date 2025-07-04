import React, { useEffect, useState } from 'react';
import {View,Text,TextInput,Button,StyleSheet,Alert,FlatList,TouchableOpacity} from 'react-native';
import { supabase } from '../../lib/supabase';
import Constants from 'expo-constants';

//const mapboxToken = Constants.expoConfig.extra.mapboxToken;
const GOOGLE_API_KEY = Constants.expoConfig.extra.googlePlacesApiKey;


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
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      query
    )}&types=establishment&key=${GOOGLE_API_KEY}`;
  
    try {
      const res = await fetch(url);
      const json = await res.json();

      console.log(json);
      setResults(json.predictions || []);
    } catch (err) {
      console.error('Google Places fetch error:', err);
      Alert.alert('Search failed');
    }
  };

  const selectPlace = async (prediction) => {
    const placeId = prediction.place_id;
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,geometry&key=${GOOGLE_API_KEY}`;
  
    try {
      const res = await fetch(detailsUrl);
      const json = await res.json();
      const place = json.result;
  
      const { name, formatted_address, geometry } = place;
      const { lat, lng } = geometry.location;
  
      const { data, error } = await supabase
        .from('restaurants')
        .upsert(
          {
            place_id: placeId,
            name,
            address: formatted_address,
            latitude: lat.toString(),
            longitude: lng.toString(),
          },
          { onConflict: 'place_id' }
        )
        .select()
        .single();
  
      if (error) {
        Alert.alert('Error saving restaurant', error.message);
      } else {
        setSelectedPlace(data);
        setResults([]);
      }
    } catch (err) {
      console.error('Place details error:', err);
      Alert.alert('Failed to load place details');
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
        placeholderTextColor="gray"
        value={query}
        onChangeText={setQuery}
      />
      <TouchableOpacity style={styles.button} onPress={handleSearch}>
        <Text style={styles.buttonText}>Search</Text>
      </TouchableOpacity>

      {results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => selectPlace(item)} style={styles.resultItem}>
              <Text>{item.text}</Text>
              <Text style={styles.subtext}>{item.description}</Text> //error dipsplaying this
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
        placeholderTextColor="gray"
        value={reviewBody}
        onChangeText={setReviewBody}
        multiline
      />
      <TextInput
        style={styles.input}
        placeholder="Rating (1–5)"
        placeholderTextColor="gray"
        value={rating}
        onChangeText={setRating}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.button} onPress={submitReview}>
        <Text style={styles.buttonText}>Submit Review</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, marginBottom: 16 },
  input: {
    borderWidth: 1,
    paddingVertical: 8,
    marginBottom: 12,
  },
  resultItem: {
    padding: 10,
    borderBottomWidth: 0.5,
  },
  subtext: {
    fontSize: 12,
    color: 'black',
  },
  selected: {
    marginVertical: 16,
    padding: 10,
    backgroundColor: '#f2f2f2',
  },
  label: {
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#722F37',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#EFDFBB',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
});
