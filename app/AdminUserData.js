import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, Alert, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import AdminFooter from './AdminFooter';

export default function AdminUserData() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [sidebarVisible, setSidebarVisible] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`http://192.168.254.253:5000/getUsers`);
        const data = await response.json();
        console.log("Fetched users:", data);
        setUsers(data);
        setFilteredUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
        Alert.alert("Error", "Failed to fetch user data.");
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(user =>
      user.username.toLowerCase().includes(searchName.toLowerCase()) &&
      user.email.toLowerCase().includes(searchEmail.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchName, searchEmail, users]);

  const confirmLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm("Are you sure you want to logout?")) {
        handleLogout();
      }
    } else {
      Alert.alert(
        "Logout Confirmation",
        "Are you sure you want to logout?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Logout", style: "destructive", onPress: handleLogout }
        ],
        { cancelable: true }
      );
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('loggedInUser');
      router.push('/LoginPage');
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };


  return (
    <View style={styles.container}>
      {/* Header */}
      <AdminHeader toggleSidebar={() => setSidebarVisible(!sidebarVisible)} />

{/* Sidebar */}
<AdminSidebar visible={sidebarVisible} closeSidebar={() => setSidebarVisible(false)} />
      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Registered Users</Text>

        {/* Search */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.input}
            placeholder="Search by Name"
            value={searchName}
            onChangeText={setSearchName}
          />
          <TextInput
            style={styles.input}
            placeholder="Search by Email"
            value={searchEmail}
            onChangeText={setSearchEmail}
            keyboardType="email-address"
          />
        </View>

        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, { flex: 2 }]}>Name</Text>
          <Text style={[styles.tableHeaderText, { flex: 3 }]}>Email</Text>
          <Text style={[styles.tableHeaderText, { flex: 1 }]}>Status</Text>
        </View>

        {/* User List */}
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item._id || item.email}
          renderItem={({ item }) => (
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2 }]}>{item.username}</Text>
              <Text style={[styles.tableCell, { flex: 3 }]}>{item.email}</Text>
              <Text style={[styles.tableCell, { flex: 1 }, styles.activeStatus]}>Active</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.noDataText}>No users found.</Text>}
        />
      </View>

        {/* Footer */}
        <AdminFooter />
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#007bff',
  },

  headerText: { fontSize: 20, fontWeight: 'bold', color: 'white' },
  logoutButton: { padding: 10 },

  sidebar: {
    position: 'absolute',
    left: 0,
    top: 60,
    width: 220,
    height: '100%',
    backgroundColor: '#333',
    paddingVertical: 20,
    zIndex: 1,
  },

  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },

  sidebarText: { color: 'white', marginLeft: 10, fontSize: 16 },

  content: { flex: 1, padding: 20 },

  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },

  searchContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },

  input: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    marginHorizontal: 5,
  },

  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e6e6e6',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 5,
  },

  tableHeaderText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
    paddingHorizontal: 5,
  },

  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 5,
    marginTop: 5,
    borderRadius: 5,
    elevation: 2,
  },

  tableCell: {
    fontSize: 14,
    color: '#333',
    paddingHorizontal: 5,
  },

  activeStatus: {
    color: 'green',
    fontWeight: 'bold',
  },

  inactiveStatus: {
    color: 'red',
    fontWeight: 'bold',
  },

  noDataText: { textAlign: 'center', fontSize: 16, color: '#888', marginTop: 20 },

  footer: { padding: 15, alignItems: 'center', backgroundColor: '#007bff' },
  footerText: { color: 'white' },
});
