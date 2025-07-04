import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function PublicProfileScreen({ route }) {
  const { userId } = route.params;

  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);

    //profile info
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('username')
      .eq('user_id', userId)
      .single();

    //user's reviews
    const { data: reviewData, error: reviewError } = await supabase
      .from('reviews')
      .select('id, body, rating, created_at, restaurants(name)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!profileError) setProfile(profileData);
    if (!reviewError) setReviews(reviewData);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderItem = ({ item }) => (
    //reviews
    <View style={styles.card}>
      <Text style={styles.restaurant}>{item.restaurants?.name || 'Unknown Restaurant'}</Text>
      <Text style={styles.body}>{item.body}</Text>
      <Text style={styles.meta}>⭐ {item.rating} · {new Date(item.created_at).toLocaleString()}</Text>
    </View>
  );

  if (loading || !profile) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#722F37" />
      </View>
    );
  }

  return (
    //profile
    <View style={styles.container}>
      <Text style={styles.username}>@{profile.username}</Text>
      <Text style={styles.sectionTitle}>Reviews</Text>
      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#722F37',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
    color: '#722F37',
  },
  list: {},
  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  restaurant: {
    fontWeight: 'bold',
    marginBottom: 6,
  },
  body: {
    fontSize: 14,
    marginBottom: 4,
  },
  meta: {
    fontSize: 12,
    color: '#722F37',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
