import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, ScrollView, ActivityIndicator, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HeaderComponent from './HeaderComponent';
import FooterComponent from './FooterComponent';

const { width } = Dimensions.get('window'); // Get device width

// Dummy images for gallery
const images = [
  require('../assets/images/g1.jpg'),
  require('../assets/images/g2.jpg'),
  require('../assets/images/g3.jpg'),
  require('../assets/images/g4.jpg'),
  require('../assets/images/g5.jpg'),
  require('../assets/images/g6.jpg'),
];

const GalleryPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(null); // Track login state
  const [loading, setLoading] = useState(true);

  // Check user login status
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const user = await AsyncStorage.getItem('loggedInUser');
        setIsLoggedIn(!!user); // Convert to boolean
      } catch (error) {
        console.error('Error checking login status:', error);
      }
      setLoading(false); // Stop loading
    };

    checkLoginStatus();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#007bff" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      {/* Header Component */}
      <HeaderComponent isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />

      {/* Gallery Section */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Box Cricket Gallery</Text>
        
        <View style={styles.galleryGrid}>
          {images.map((img, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image source={img} style={styles.galleryImage} />
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Footer Component */}
      <FooterComponent />
    </View>
  );
};

// Ensure this is a default export
export default GalleryPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007bff',
    textAlign: 'center',
    marginBottom: 15,
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  imageContainer: {
    margin: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  galleryImage: {
    width: Platform.OS === 'android' ? width * 0.9 : width * 0.45, // Android → 90%, Web → 45%
    height: 200,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
