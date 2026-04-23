import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import HeaderComponent from './HeaderComponent';
import FooterComponent from './FooterComponent';

const { width } = Dimensions.get('window');
const cardWidth = width * 0.45;

const API_BASE_URL = `http://192.168.254.253:5000/areas/all`; 

export default function AreaWiseBoxCricket() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedArea, setSelectedArea] = useState('');
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const user = await AsyncStorage.getItem('loggedInUser');
        setIsLoggedIn(!!user);
      } catch (error) {
        console.error("Error checking login status:", error);
      }
    };

    checkLoginStatus();
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    try {
      const response = await fetch(API_BASE_URL);
      const data = await response.json();
      setAreas(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching areas:", error);
      setLoading(false);
    }
  };

  const handleAreaPress = (areaName) => {
    router.push({
      pathname: '/AreaWiseSlot',
      params: { area: areaName },
    });
  };

  const filteredAreas = selectedArea ? areas.filter(area => area.name === selectedArea) : areas;

  return (
    <View style={styles.container}>
      <HeaderComponent isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />

      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Select Area:</Text>
        <Picker
          selectedValue={selectedArea}
          onValueChange={(itemValue) => setSelectedArea(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="All Areas" value="" />
          {areas.map((area) => (
            <Picker.Item key={area._id} label={area.name} value={area.name} />
          ))}
        </Picker>
      </View>

      <View style={styles.contentWrapper}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {loading ? (
            <ActivityIndicator size="large" color="blue" />
          ) : filteredAreas.length > 0 ? (
            filteredAreas.map((area) => (
              <TouchableOpacity key={area._id} onPress={() => handleAreaPress(area.name)} style={styles.cardWrapper}>
                <View style={styles.card}>
                  <Image
                    source={{ uri: area.image || 'https://via.placeholder.com/300' }}
                    style={styles.cardImage}
                  />
                  <View style={styles.cardTextContainer}>
                    <Text style={styles.cardText}>{area.name}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noResultsText}>No areas found</Text>
          )}
        </ScrollView>

        {/* Footer at the bottom */}
        <FooterComponent />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },

  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  filterLabel: { fontSize: 16, fontWeight: 'bold', marginRight: 10 },
  picker: { flex: 1, backgroundColor: '#fff', borderRadius: 8 },

  contentWrapper: {
    flex: 1,
    justifyContent: 'space-between',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardWrapper: {
    width: cardWidth,
    marginBottom: 10,
  },
  card: {
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  cardImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  cardTextContainer: {
    padding: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  cardText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  noResultsText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'gray',
    marginTop: 10,
    width: '100%',
  },
});
