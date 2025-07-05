import React, { useEffect, useState,useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { supabase } from '../../lib/supabase';
import { useFocusEffect } from '@react-navigation/native';

export default function ExploreScreen() {
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFollowingReviews = async () => {
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    const currentUserId = userData?.user?.id;
    if (!currentUserId) return;

    //get users followed by user logged
    const { data: follows } = await supabase
      .from('profile_follows')
      .select('following_id')
      .eq('follower_id', currentUserId);

    const followingIds = follows?.map(f => f.following_id) || [];

    if (followingIds.length === 0) {
      setMarkers([]);
      setLoading(false);
      return;
    }

    //get reviews from followed users
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
      `).in('user_id', followingIds);

    const validMarkers = data.filter(r => r.restaurants?.latitude && r.restaurants?.longitude).map(r => ({
            id: r.id,
            username: r.profiles?.username,
            restaurant: r.restaurants?.name,
            lat: parseFloat(r.restaurants?.latitude),
            lng: parseFloat(r.restaurants?.longitude),
            rating: r.rating,
    }));

    setMarkers(validMarkers);

    setLoading(false);
  };

  useEffect(() => {
    fetchFollowingReviews();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#722F37" />
      </View>
    );
  }

  if (markers.length == 0) {
    return (
      <View style={styles.loader}>
        <Text style={{ color: '#722F37' }}>No reviews from followed users yet.</Text>
      </View>
    );
  }

  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: markers[0].lat,
        longitude: markers[0].lng,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      }}
    >
      {markers.map((m) => (
        <Marker
          key={m.id}
          coordinate={{ latitude: m.lat, longitude: m.lng }}
          pinColor="#722F37"
        >
          <Callout>
            <View>
              <Text style={styles.calloutTitle}>{m.restaurant}</Text>
              <Text>@{m.username}</Text>
              <Text>⭐ {m.rating}</Text>
            </View>
          </Callout>
        </Marker>
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calloutTitle: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
});
