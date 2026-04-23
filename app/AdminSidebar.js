import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AdminSidebar = ({ visible, closeSidebar }) => {
  const [sidebarColor, setSidebarColor] = useState('#007bff'); // Default sidebar color
  const router = useRouter();

  useEffect(() => {
    const loadSidebarColor = async () => {
      const savedSidebarColor = await AsyncStorage.getItem('sidebarColor');
      if (savedSidebarColor) {
        setSidebarColor(savedSidebarColor); // Load saved sidebar color
      }
    };
    loadSidebarColor();
  }, []);

  if (!visible) return null;

  const navigationItems = [
    { title: "Dashboard", icon: "home-outline", route: "/Admin" },
    { title: "Users", icon: "people-outline", route: "/AdminUserData" },
    { title: "Bookings", icon: "calendar-outline", route: "/AdminBookingData" },
    { title: "Manage Areas", icon: "map-outline", route: "/AdminManageAreas" },
    { title: "Manage Slots", icon: "time-outline", route: "/AdminManageSlot" },
  ];

  const confirmLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm("Are you sure you want to logout?")) handleLogout();
    } else {
      Alert.alert("Logout Confirmation", "Are you sure you want to logout?", [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", style: "destructive", onPress: handleLogout }
      ]);
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
    <View style={[styles.sidebar, { backgroundColor: sidebarColor }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={closeSidebar} style={styles.closeButton}>
          <Ionicons name="close-outline" size={30} color="white" />
        </TouchableOpacity>
      </View>

      <View>
        {navigationItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.sidebarItem}
            onPress={() => {
              router.push(item.route);
              closeSidebar();
            }}
          >
            <Ionicons name={item.icon} size={20} color="white" />
            <Text style={styles.sidebarText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.sidebarItem} onPress={confirmLogout}>
        <Ionicons name="log-out-outline" size={20} color="white" />
        <Text style={styles.sidebarText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    paddingVertical: 20,
    paddingHorizontal: 15,
    position: 'absolute',
    left: 0,
    top: 80,
    bottom: 0,
    width: 200,
    zIndex: 10,
    justifyContent: 'space-between',
  },
  header: {
    position: 'absolute',
    top: 0,
    right: 15,
    zIndex: 20,
  },
  closeButton: {
    padding: 10,
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
});

export default AdminSidebar;
