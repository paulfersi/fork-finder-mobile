import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function MyAccountScreen() {
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState(null);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    const getUserAndStats = async () => {
      const { data: userData, error: authError } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user || authError) return;

      setUserId(user.id);

      //profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('username')
        .eq('user_id', user.id)
        .single();

      if (!profileError) setUsername(profile.username);

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
    };

    getUserAndStats();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.username}>@{username || 'Loading'}</Text>

      <View style={styles.followCounts}>
        <Text style={styles.followCount}>{followerCount} Followers</Text>
        <Text style={styles.followCount}>{followingCount} Following</Text>
      </View>

      <Text style={styles.label}>User ID</Text>
      <Text style={styles.userId}>{userId || 'Loading...'}</Text>

      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  username: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#722F37',
    marginBottom: 12,
  },
  followCounts: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  followCount: {
    fontSize: 14,
    color: '#333',
  },
  label: {
    fontSize: 12,
    color: '#722F37',
    marginTop: 10,
  },
  userId: {
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: '#722F37',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  logoutText: {
    color: '#EFDFBB',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});
