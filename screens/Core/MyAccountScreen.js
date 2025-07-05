import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function MyAccountScreen() {
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState(null);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const getUserAndStats = async () => {
      const { data: userData, error: authError } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user || authError) return;

      setUserId(user.id);

      //profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('user_id', user.id)
        .single();

      if (profile) setUsername(profile.username);

      //count followers
      const { count: followers } = await supabase
        .from('profile_follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', user.id);
      setFollowerCount(followers || 0);

      //count following
      const { count: following } = await supabase
        .from('profile_follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', user.id);
      setFollowingCount(following || 0);

      //my reviews
      const { data: reviewData } = await supabase
        .from('reviews')
        .select('id, body, rating, created_at, restaurants(name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (reviewData) setReviews(reviewData);
    };

    getUserAndStats();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  //delerte review
  const handleDelete = (reviewId) => {
    // Show a confirmation dialog
    Alert.alert(
      'Delete Review',
      'Are you sure you want to delete this review?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase
              .from('reviews')
              .delete()
              .eq('id', reviewId);
  
            if (error) {
              console.error('Delete failed:', error.message);
            } else {
              setReviews((prev) => prev.filter((r) => r.id !== reviewId));
            }
          },
        },
      ],
      { cancelable: true }
    );
  };
  
  
  //edit review
  const handleEdit = async (review) => {
    const newBody = prompt('Edit your review:', review.body);
    const newRating = prompt('Update rating (1-5):', review.rating.toString());
  
    const parsedRating = parseInt(newRating);
    if (!newBody || isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      alert('Invalid input.');
      return;
    }
  
    const { error } = await supabase
      .from('reviews')
      .update({
        body: newBody,
        rating: parsedRating,
      })
      .eq('id', review.id);
  
    if (error) {
      console.error('Edit failed:', error.message);
    } else {
      // Refresh reviews from DB
      const { data: refreshed } = await supabase
        .from('reviews')
        .select('id, body, rating, created_at, restaurants(name)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
  
      setReviews(refreshed || []);
    }
  };
  
  const renderReview = ({ item }) => (
    <View style={styles.reviewCard}>
      <Text style={styles.restaurant}>{item.restaurants?.name || 'Unknown Restaurant'}</Text>
      <Text style={styles.body}>{item.body}</Text>
      <Text style={styles.meta}>⭐ {item.rating} · {new Date(item.created_at).toLocaleString()}</Text>
  
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => handleEdit(item)}
          style={[styles.actionButton, { backgroundColor: '#FFD166' }]}
        >
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
  
        <TouchableOpacity
          onPress={() => handleDelete(item.id)}
          style={[styles.actionButton, { backgroundColor: '#EF476F' }]}
        >
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  

  return (
    <View style={styles.container}>
      <Text style={styles.username}>@{username || 'Loading'}</Text>

      <View style={styles.followCounts}>
        <Text style={styles.followCount}>{followerCount} Followers</Text>
        <Text style={styles.followCount}>{followingCount} Following</Text>
      </View>

      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>My Reviews</Text>
      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        renderItem={renderReview}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  username: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#722F37',
    marginBottom: 12,
    textAlign: 'center',
  },
  followCounts: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 12,
  },
  followCount: {
    fontSize: 14,
    color: '#333',
  },
  label: {
    fontSize: 12,
    color: '#722F37',
    marginTop: 10,
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#722F37',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 24,
  },
  logoutText: {
    color: '#EFDFBB',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#722F37',
    marginBottom: 12,
  },
  reviewCard: {
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
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  actionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
