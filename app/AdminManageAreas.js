import React, { useEffect, useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, FlatList, Alert, StyleSheet, 
  Image, ScrollView, Platform 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import AdminFooter from './AdminFooter';

export default function AdminManageAreas() {
  const [areas, setAreas] = useState([]);
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [editingArea, setEditingArea] = useState(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const router = useRouter();

  const API_BASE_URL = `http://192.168.254.253:5000/areas`;

  useEffect(() => {
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/all`);
      if (!response.ok) throw new Error('Failed to fetch areas');
      const data = await response.json();
      setAreas(data);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleAddOrUpdateArea = async () => {
    if (!name || !image) {
      Alert.alert('Validation Error', 'Please fill all fields');
      return;
    }

    try {
      const url = editingArea ? `${API_BASE_URL}/update/${editingArea._id}` : `${API_BASE_URL}/add`;
      const method = editingArea ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, image }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Failed to ${editingArea ? 'update' : 'add'} area`);
      }

      alert(`Area ${editingArea ? 'updated' : 'added'} successfully`);
      setEditingArea(null);
      setName('');
      setImage('');
      fetchAreas();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleEditArea = (area) => {
    setEditingArea(area);
    setName(area.name);
    setImage(area.image);
  };

  const handleDeleteArea = async (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this area?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/delete/${id}`, { method: 'DELETE' });
              if (!response.ok) throw new Error('Failed to delete area');
              Alert.alert('Success', 'Area deleted successfully');
              fetchAreas();
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('loggedInUser');
    router.push('/LoginPage');
  };

  const confirmLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to logout?')) {
        handleLogout();
      }
    } else {
      Alert.alert('Logout Confirmation', 'Are you sure you want to logout?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: handleLogout }
      ]);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <AdminHeader toggleSidebar={() => setSidebarVisible(!sidebarVisible)} />

{/* Sidebar */}
<AdminSidebar visible={sidebarVisible} closeSidebar={() => setSidebarVisible(false)} />


      {/* Main Content */}
      <ScrollView style={styles.mainContent}>
        <Text style={styles.heading}>
          {editingArea ? 'Update Area' : 'Manage Cricket Areas'}
        </Text>

        <TextInput 
          style={styles.input} 
          value={name} 
          onChangeText={setName} 
          placeholder="Enter area name" 
        />
        <TextInput 
          style={styles.input} 
          value={image} 
          onChangeText={setImage} 
          placeholder="Enter image URL" 
        />

        <TouchableOpacity 
          style={styles.addButton} 
          onPress={handleAddOrUpdateArea}
        >
          <Text style={styles.buttonText}>
            {editingArea ? 'Update Area' : 'Add Area'}
          </Text>
        </TouchableOpacity>

        <FlatList
          data={areas}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.tableRow}>
              <Image source={{ uri: item.image }} style={styles.image} />
              <Text style={styles.tableCell}>{item.name}</Text>
              <View style={styles.actionButtons}>
                <TouchableOpacity onPress={() => handleEditArea(item)}>
                  <Ionicons name="create-outline" size={24} color="blue" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteArea(item._id)}>
                  <Ionicons name="trash-outline" size={24} color="red" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </ScrollView>
       {/* Footer */}
       <AdminFooter />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#007bff',
    padding: 15,
  },
  headerText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 5,
  },
  sidebar: {
    backgroundColor: '#333',
    paddingVertical: 20,
    paddingHorizontal: 15,
    position: 'absolute',
    left: 0,
    top: 60,
    bottom: 0,
    width: 200,
    zIndex: 10,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  sidebarText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 10,
  },
  mainContent: { flex: 1, padding: 20 },
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  input: { 
    borderWidth: 1, borderColor: '#ccc', padding: 10, marginVertical: 5, 
    borderRadius: 5, backgroundColor: 'white' 
  },
  addButton: { 
    backgroundColor: '#007bff', padding: 12, borderRadius: 5, 
    alignItems: 'center', marginBottom: 10 
  },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  tableRow: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: 'white', padding: 10, borderRadius: 5, marginVertical: 5,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 
  },
  image: { width: 50, height: 50, marginRight: 10, borderRadius: 5 },
  tableCell: { flex: 1, fontSize: 16, fontWeight: '500' },
  actionButtons: { flexDirection: 'row', justifyContent: 'space-around', width: 80 },
});
