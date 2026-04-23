import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Dimensions } from 'react-native';
import HeaderComponent from './HeaderComponent';
import FooterComponent from './FooterComponent';

const { width } = Dimensions.get('window');

export default function AboutPage() {
  return (
    <View style={styles.container}>
      {/* Header Component */}
      <HeaderComponent />

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.imageTextContainer}>
          <Image source={require('../assets/images/slider3.jpg')} style={styles.aboutImage} />
          <View style={styles.textContainer}>
            <Text style={styles.title}>About Box Cricket Booking</Text>
            <Text style={styles.description}>
              Welcome to BoxCricket2025, your go-to platform for hassle-free box cricket bookings!
              Our system allows users to seamlessly browse available slots, make reservations, and enjoy
              an uninterrupted cricket experience with friends and family.
            </Text>
          </View>
        </View>

        <Text style={styles.subtitle}>Features:</Text>
        <View style={styles.listContainer}>
          <Text style={styles.listItem}>✅ Easy slot booking and management</Text>
          <Text style={styles.listItem}>✅ Secure user authentication</Text>
          <Text style={styles.listItem}>✅ Seamless payment integration</Text>
          <Text style={styles.listItem}>✅ Area-wise slot availability</Text>
          <Text style={styles.listItem}>✅ User-friendly interface</Text>
        </View>

        <Text style={styles.subtitle}>Our Mission</Text>
        <Text style={styles.description}>
          Our mission is to make box cricket accessible to everyone by providing an intuitive
          and reliable booking system. Whether you're playing for fun or competing, we ensure
          you have the best experience possible.
        </Text>
      </ScrollView>

      {/* Footer Component */}
      <FooterComponent />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
    alignItems: 'center',
  },
  imageTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  aboutImage: {
    width: width * 0.4, // 40% of screen width
    height: width * 0.4, // Maintain aspect ratio
    marginRight: 15,
    borderRadius: 10,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
  },
  description: {
    fontSize: 16,
    color: '#555',
    textAlign: 'left',
    marginBottom: 10,
  },
  listContainer: {
    alignSelf: 'flex-start',
    paddingLeft: 10,
  },
  listItem: {
    fontSize: 16,
    color: '#444',
    marginVertical: 3,
  },
});

