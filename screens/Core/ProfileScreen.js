import React from 'react';
import { View, Text, Button } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function ProfileScreen() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Profile screen</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}
