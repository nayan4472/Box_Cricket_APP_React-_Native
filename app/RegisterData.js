import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, ScrollView, Button, RefreshControl } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';


// Get screen width for responsiveness
const { width } = Dimensions.get('window');

export default function RegisterData() {
  const [users, setUsers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  // Fetching registered users from the backend
  const fetchUserData = async () => {
    try {
      const response = await axios.get(`http://192.168.254.253:5000/getUsers`);
      console.log('Response:', response); // Add this to inspect the full response
      if (response.status === 200) {
        setUsers(response.data.users);
      } else {
        console.error('Unexpected response:', response);
      }
    } catch (error) {
      if (error.response) {
        console.error('Response error:', error.response.data);
        alert(`Error: ${error.response.data.message || 'Something went wrong.'}`);
      } else if (error.request) {
        console.error('Request error:', error.request);
        alert('No response received from server.');
      } else {
        console.error('Error:', error.message);
        alert('An error occurred.');
      }
    }
  };
  

  // Refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserData();
    setRefreshing(false);
  };

  // Use effect to fetch users on page load
  useEffect(() => {
    fetchUserData();
  }, []);

  // Render individual user rows
  const renderItem = ({ item }) => {
    console.log(item); // Inspect the `item` object to make sure it contains _id
    return (
      <View style={styles.userRow}>
        <Text style={styles.userText}>{item.username}</Text>
        <Text style={styles.userText}>{item.email}</Text>
      </View>
    );
  };
  

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.title}>Registered Users</Text>
  
      {users.length === 0 ? (
        <Text>Loading users...</Text>
      ) : (
        <FlatList
          data={users}
          renderItem={renderItem}
          keyExtractor={(item) => item._id.toString()}
          style={styles.userList}
        />
      )}
  
      <Button title="Go Back" onPress={() => router.push('/LoginPage')} />
    </ScrollView>
  );
  
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    minHeight: '100%',
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    color: 'skyblue',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  userList: {
    width: width > 600 ? 400 : '90%',
  },
  userRow: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 8,
    backgroundColor: 'white',
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  userText: {
    flex: 1,
    color: '#333',
    fontSize: 16,
  },
});
