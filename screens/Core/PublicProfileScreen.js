import React, { useEffect, useState,useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { supabase } from '../../lib/supabase';
import { TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

export default function PublicProfileScreen({ route }) {
  const { displayedUserId } = route.params;  //user searched

  const [currentUserId, setCurrentUserId] = useState(null)
  const [isFollowing, setIsFollowing] = useState(false)

  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followerCount,setFollowerCount] = useState(0);
  const [followingCount,setFollowingCount] = useState(0)

  const fetchData = async () => {
    setLoading(true);

    //get logged user id
    const { data: sessionData } = await supabase.auth.getUser();
    const currentId = sessionData?.user?.id;
    setCurrentUserId(currentId);

    //check if logged user(currentId) follows the displayed id(displayedUserId)
    const { data: followData } = await supabase
    .from('profile_follows')
    .select('*')
    .eq('follower_id', currentId)
    .eq('following_id', displayedUserId)
    .single();

    setIsFollowing(!!followData);

    //profile info
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('username')
      .eq('user_id', displayedUserId)
      .single();

    //count followers
    const { count: followers, error: followersError } = await supabase
        .from('profile_follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', displayedUserId);
    
    if (!followersError) setFollowerCount(followers);

    //count following
    const { count: following, error: followingError } = await supabase
        .from('profile_follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', displayedUserId);
    
    if (!followingError) setFollowingCount(following);


    //user's reviews
    const { data: reviewData, error: reviewError } = await supabase
      .from('reviews')
      .select('id, body, rating, created_at, restaurants(name)')
      .eq('user_id', displayedUserId)
      .order('created_at', { ascending: false });

    //console.log(reviewData); DEBUG

    if (!profileError) setProfile(profileData);
    if (!reviewError) setReviews(reviewData);

    setLoading(false);
  };

  const toggleFollow = async () => {
    if (!currentUserId || !displayedUserId) return;
  
    if (isFollowing) {
      // Unfollow
      const { error } = await supabase
        .from('profile_follows')
        .delete()
        .match({ follower_id: currentUserId, following_id: displayedUserId });
  
      if (!error) setIsFollowing(false);
    } else {
      // Follow
      const { error } = await supabase
        .from('profile_follows')
        .insert([{ follower_id: currentUserId, following_id: displayedUserId }]);
  
      if (!error) setIsFollowing(true);
    }
  };      

    useFocusEffect(
        useCallback(() => {
            fetchData();
    }, []));

  const renderReview = ({ review }) => (
    //reviews
    <View style={styles.card}>
      <Text style={styles.restaurant}>{review.restaurants?.name || 'Unknown Restaurant'}</Text>
      <Text style={styles.body}>{review.body}</Text>
      <Text style={styles.meta}>⭐ {review.rating} · {new Date(review.created_at).toLocaleString()}</Text>
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
      <View style={styles.followCounters}>
        <Text style={styles.followCounter}>{followerCount} Followers</Text>
        <Text style={styles.followCounter}>{followingCount} Following</Text>
      </View>
      {currentUserId !== displayedUserId && (
        <TouchableOpacity style={styles.followButton} onPress={toggleFollow}>
            <Text style={styles.followButtonText}>
            {isFollowing ? 'Unfollow' : 'Follow'}
            </Text>
        </TouchableOpacity>
        )}

      <Text style={styles.sectionTitle}>Reviews</Text>
      <FlatList
        data={reviews}
        keyExtractor={(review) => review.id}
        renderItem={({ item }) => renderReview({ review: item })}
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
  followButton: {
    backgroundColor: '#722F37',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  followButtonText: {
    color: '#EFDFBB',
    fontWeight: 'bold',
    fontSize: 16,
  },
  followCounters: {
    flexDirection: 'row',
    gap: 16,
    marginVertical: 8,
  },
  followCounter: {
    color: '#555',
    fontSize: 14,
  },
  
  
});
