import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function FooterComponent() {
  const [footerColor, setFooterColor] = useState('#007bff'); // Default color
  const router = useRouter();

  // Fetch user footer color from AsyncStorage
  useEffect(() => {
    const loadFooterColor = async () => {
      const savedUserFooterColor = await AsyncStorage.getItem('userFooterColor');
      setFooterColor(savedUserFooterColor || '#007bff'); // Use saved color or default
    };
    loadFooterColor();
  }, []);

  return (
    <View style={[styles.footerContainer, { backgroundColor: footerColor }]}>
      <TouchableOpacity style={styles.footerItem} onPress={() => router.push('/GalleryPage')}>
        <Icon name="images" size={22} color="white" />
        <Text style={styles.footerText}>Gallery</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.footerItem} onPress={() => router.push('/AboutPage')}>
        <Icon name="information-circle" size={22} color="white" />
        <Text style={styles.footerText}>About</Text>
      </TouchableOpacity>

      {/* Developer Credit - Compact size */}
      <View style={styles.creditContainer}>
        <Text style={styles.footerCredit}>Developed by Yash Khalas @ BoxCricket2025</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10, // Reduced padding to match header height
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flexWrap: 'wrap',
  },
  footerItem: {
    alignItems: 'center',
  },
  footerText: {
    color: 'white',
    fontSize: 12,
    marginTop: 3, // Reduced space
  },
  creditContainer: {
    width: '100%',
    alignItems: 'center',
  },
  footerCredit: {
    color: 'white',
    fontSize: 14, // Reduced font size for balance
    fontWeight: 'bold',
  },
});
