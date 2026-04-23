import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HeaderComponent({ isLoggedIn, setIsLoggedIn }) {
  const router = useRouter();
  const [headerColor, setHeaderColor] = useState('#007bff'); // Default color

  // Function to fetch header color from AsyncStorage
  const fetchHeaderColor = async () => {
    const savedHeaderColor = await AsyncStorage.getItem('userHeaderColor');
    if (savedHeaderColor) {
      setHeaderColor(savedHeaderColor); // Apply saved color
    }
  };

  // Fetch header color on component mount
  useEffect(() => {
    fetchHeaderColor();
  }, []);

  // Function to perform logout
  const performLogout = async () => {
    try {
      await AsyncStorage.removeItem('loggedInUser');
      setIsLoggedIn(false); // Update login state
      router.replace('/login'); // Navigate to login page
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Handle Logout with confirmation alert
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "OK", onPress: performLogout } // Calls performLogout instead of async function
      ]
    );
  };

  return (
    <View style={[styles.header, { backgroundColor: headerColor }]}>
      {/* Logo on the Left Side */}
      <Pressable onPress={() => router.push('/HomePage')} style={styles.logoContainer}>
        <Image source={require('../assets/images/icon.png')} style={styles.logo} />
      </Pressable>

      {/* Navigation Items */}
      <View style={styles.navItems}>
        {isLoggedIn ? (
          <>
            {renderNavItem("HomePage", "home", "Home")}
            {renderNavItem("AreaWiseBoxCricket", "map-marker", "Area")}
            {renderNavItem("UserBooking", "calendar-check-o", "Bookings")}
            {renderNavItem("ProfilePage", "user", "Profile")}
          </>
        ) : (
          <>
            {renderNavItem("HomePage", "home", "Home")}
            {renderNavItem("AreaWiseBoxCricket", "map-marker", "Area")}
            {renderNavItem("LoginPage", "sign-in", "Login")}
            {renderNavItem("RegisterPage", "user-plus", "Sign Up")}
          </>
        )}
      </View>
    </View>
  );

  // Helper function to render navigation items
  function renderNavItem(route, icon, label, onPress = () => router.push(`/${route}`), isLogout = false) {
    return (
      <Pressable
        key={route}
        style={styles.navItem}
        onPress={onPress}
      >
        <FontAwesome name={icon} size={22} color={isLogout ? "red" : "white"} />
        <Text style={[styles.navText, isLogout && styles.logoutText]}>{label}</Text>
      </Pressable>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    width: '100%',
  },
  logoContainer: {
    marginRight: 15,
  },
  logo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  navItems: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-evenly',
  },
  navItem: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  navText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  logoutText: {
    color: 'red',
  },
});
