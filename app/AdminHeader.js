import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Platform, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const AdminHeader = ({ toggleSidebar }) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [headerColor, setHeaderColor] = useState('#007bff');
  const router = useRouter();

  useEffect(() => {
    const fetchHeaderColor = async () => {
      const color = await AsyncStorage.getItem('headerColor');
      if (color) setHeaderColor(color);
    };
    fetchHeaderColor();
  }, []);

  const toggleDropdown = () => setDropdownVisible(!dropdownVisible);

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
        { text: 'Logout', style: 'destructive', onPress: handleLogout },
      ]);
    }
  };

  const handleSettings = () => {
    setDropdownVisible(false);
    router.push('/AdminSettings');
  };

  return (
    <View style={[styles.header, { backgroundColor: headerColor }]}>
      <TouchableOpacity onPress={toggleSidebar}>
        <Ionicons name="menu-outline" size={32} color="white" />
      </TouchableOpacity>

      <Text style={styles.headerText}>Box Cricket</Text>

      <View style={styles.profileContainer}>
        <TouchableOpacity onPress={toggleDropdown} style={styles.profileButton}>
          <Ionicons name="person-circle" size={30} color="white" />
        </TouchableOpacity>

        {dropdownVisible && (
          <View style={styles.dropdownMenu}>
            <TouchableOpacity onPress={handleSettings} style={styles.dropdownItem}>
              <Ionicons name="settings-outline" size={18} color="#333" />
              <Text style={styles.dropdownText}>Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={confirmLogout} style={styles.dropdownItem}>
              <Ionicons name="log-out-outline" size={18} color="#333" />
              <Text style={styles.dropdownText}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    position: 'relative',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  profileContainer: {
    position: 'relative',
  },
  profileButton: {
    padding: 10,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 45,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 4,
    paddingVertical: 8,
    minWidth: 140,
    zIndex: 10,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  dropdownText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
});

export default AdminHeader;
