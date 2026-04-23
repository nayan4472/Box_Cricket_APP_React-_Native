import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
  Text,
  Button,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import HeaderComponent from './HeaderComponent';
import FooterComponent from './FooterComponent';

const { width, height } = Dimensions.get('window');

const images = [
  require('../assets/images/slider1.jpg'),
  require('../assets/images/slider2.jpg'),
  require('../assets/images/slider3.jpg'),
];

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchLoggedInUser = async () => {
      try {
        const loggedInUser = await AsyncStorage.getItem('loggedInUser');
        if (loggedInUser) {
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('Error fetching logged-in user:', error);
      }
    };

    fetchLoggedInUser();
  }, []);

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % images.length);
    }, 3000);

    return () => clearInterval(slideTimer);
  }, []);

  const navigateToArea = () => {
    router.push('/AreaWiseBoxCricket'); // Adjust route if your Area screen path differs
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {/* Dynamic Header */}
      <HeaderComponent isLoggedIn={isLoggedIn} setIsLoggedIn={undefined} />

      <View style={styles.container}>
        {/* Image Slider */}
        <View style={styles.sliderContainer}>
          <Image source={images[currentSlide]} style={styles.slideImage} />
        </View>

        {/* Box Cricket Info Section */}
        <View style={styles.infoContainer}>
          <Text style={styles.heading}>Welcome to Box Cricket</Text>
          <Text style={styles.paragraph}>
            Looking for an exciting game of cricket with your friends? Our Box
            Cricket facility offers top-notch turf grounds, easy slot bookings,
            and great amenities. Perfect for quick matches, tournaments, and
            late-night games!
          </Text>

          <Text style={styles.subheading}>Why Choose Us?</Text>
          <Text style={styles.paragraph}>
            ✅ Premium turf pitches{'\n'}
            ✅ Book slots in real-time{'\n'}
            ✅ Multiple locations across the city{'\n'}
            ✅ Affordable hourly pricing{'\n'}
            ✅ Friendly staff & clean facilities
          </Text>

          {/* Button to go to Area list */}
          <View style={styles.buttonWrapper}>
            <Button title="View Available Areas" onPress={navigateToArea} />
          </View>
        </View>
      </View>

      {/* Footer */}
      <FooterComponent />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingBottom: 20,
  },
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  sliderContainer: {
    width: width * 0.9,
    height: height * 0.4,
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 20,
  },
  slideImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  infoContainer: {
    marginTop: 30,
    width: width * 0.9,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 5,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
  },
  buttonWrapper: {
    marginTop: 20,
    alignItems: 'center',
  },
});
