import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect,useNavigation  } from '@react-navigation/native';
import {View,Text,FlatList,StyleSheet,ActivityIndicator,TouchableOpacity} from 'react-native';
import { supabase } from '../../lib/supabase';

export default function FeedScreen() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation();

  const fetchReviews = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('reviews')
      .select(`
        id,
        body,
        rating,
        created_at,
        user_id,
        profiles:profiles!reviews_user_id_fkey(username), 
        restaurants(name,latitude,longitude)
      `)  //profiles:profiles!reviews_user_id_fkey(username) : this joins profiles and use the relationship named "reviews_user_id_fkey"
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error.message);
    } else {
      setReviews(data);
    }

    setLoading(false);
  };

  //reruns code every time we focus on this screen
  useFocusEffect(
    useCallback(() => {
      fetchReviews();
    }, []));

  const renderItem = ({ item }) => {
    const { body, rating, created_at, profiles, restaurants } = item;

    return (
      <View style={styles.card}>
        <Text style={styles.username}>@{profiles?.username || 'unknown'}</Text>
        <Text style={styles.restaurant}>{restaurants?.name || 'Restaurant'}</Text>
        <Text style={styles.body}>{body}</Text>
        <Text style={styles.meta}>⭐ {rating} · {new Date(created_at).toLocaleString()}</Text>
        <TouchableOpacity
          style={styles.mapButton}
          onPress={() =>
            navigation.navigate('MapView', {
              name: restaurants?.name,
              latitude: restaurants?.latitude,
              longitude: restaurants?.longitude,
            })
          }
        >
          <Text style={styles.mapButtonText}>View on Map</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <FlatList
      data={reviews}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
  },
  username: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  restaurant: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  body: {
    fontSize: 14,
    marginBottom: 8,
  },
  meta: {
    fontSize: 12,
    color: 'gray',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapButton: {
    backgroundColor: '#722F37',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop:10
  },
  mapButtonText: {
    color: '#EFDFBB',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  
});
