import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function ProfileScreen() {
  const [userId, setUserId] = useState(null);
  const [username,setUsername] = useState(null);

  useEffect(() => {
    const getUserAndProfile = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        console.error('Auth error:', error.message);
        return;
      }

      const user = data?.user;
      if (user) {
        setUserId(user.id);

        // Fetch the username from profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('username')
          .eq('user_id', user.id)
          .single();

        if (profileError) {
          console.error('Profile fetch error:', profileError.message);
        } else {
          setUsername(profile.username);
        }
      }
    };

    getUserAndProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <View style={styles.container}>
      <Text>@ {username || 'Loading'}</Text>
      <Text>User ID:</Text>
      <Text style={styles.userId}>{userId || 'Loading...'}</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  userId: { fontWeight: 'bold', marginVertical: 10 },
});
