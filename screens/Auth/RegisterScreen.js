import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useEffect } from 'react';


export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username,setUsername] = useState('');

  const signUp = async () => {
    if (!email || !password || !username) {
      Alert.alert('All fields are required');
      return;
    }
  
    const { data, error } = await supabase.auth.signUp({ email, password });
  
    if (error) {
      Alert.alert('Registration failed', error.message);
      return;
    }
  
    const user = data?.user;
  
    if (user) {
      const { error: profileError } = await supabase.from('profiles').insert([
        {
          user_id: user.id,
          username: username,
        },
      ]);
  
      if (profileError) {
        Alert.alert('Profile creation failed', profileError.message);
      } else {
        Alert.alert('Success! Please check your email to confirm your account.');
        navigation.navigate('Login');
      }
    } else {
      Alert.alert('Registration pending', 'Check your email to confirm the account.');
    }
  };
  

  return (
    <View style={styles.container}>
      <TextInput placeholder="Username" onChangeText={setUsername} style={styles.input} />
      <TextInput placeholder="Email" onChangeText={setEmail} style={styles.input} />
      <TextInput placeholder="Password" secureTextEntry onChangeText={setPassword} style={styles.input} />
      <Button title="Register" onPress={signUp} />
      <Button title="Already have an account?" onPress={() => navigation.navigate('Login')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor:"#EFDFBB" },
  input: { marginBottom: 10, borderBottomWidth: 1, padding: 8, backgroundColor: "#722F37"},
});
