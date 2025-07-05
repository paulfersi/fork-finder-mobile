import React, { useState } from 'react';
import {View,TextInput,Text,FlatList,StyleSheet,TouchableOpacity,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { useNavigation } from '@react-navigation/native';

export default function SearchProfileScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const navigation = useNavigation();

  const searchProfiles = async (text) => {
    setQuery(text);

    if (text.length === 0) {
      setResults([]);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('username,user_id')
      .ilike('username', `%${text}%`) //casee insensitive
      .limit(10);

    if (error) {
      console.error('Search error:', error.message);
    } else {
      setResults(data);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('PublicProfile', { displayedUserId: item.user_id })}>
      <Text style={styles.username}>@{item.username}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search by username"
        value={query}
        onChangeText={searchProfiles}
      />

      <FlatList
        data={results}
        keyExtractor={(item) => item.username}
        renderItem={renderItem}
        ListEmptyComponent={
          query.length > 0 && (
            <Text style={styles.empty}>No users found</Text>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  input: {
    backgroundColor: '#722F37',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderColor: '#722F37',
    borderWidth: 1,
    marginBottom: 16,
  },
  item: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#722F37',
  },
  empty: {
    textAlign: 'center',
    color: '#722F37',
    marginTop: 20,
  },
});
