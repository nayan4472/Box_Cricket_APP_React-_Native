// app/AreaWiseSlot.js
import React, { useState, useEffect, useCallback, useLayoutEffect } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  ActivityIndicator, Alert, SafeAreaView,
  RefreshControl, TextInput, Modal
} from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format, isToday, parse, parseISO, isAfter } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const generateDates = (numDays = 7) => {
  const today = new Date();
  return Array.from({ length: numDays }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    return {
      day: format(date, 'EEE').toUpperCase(),
      date: format(date, 'dd'),
      month: format(date, 'MMM').toUpperCase(),
      fullDate: format(date, 'yyyy-MM-dd'),
    };
  });
};

const getBestSlots = (slots) => {
  const availableSlots = slots.filter((s) => !s.isBooked);
  if (availableSlots.length === 0) return [];

  const minPrice = Math.min(...availableSlots.map((s) => s.price));
  const cheapestSlots = availableSlots.filter((s) => s.price === minPrice);

  return cheapestSlots.map((s) => `${s.start_time.trim()}-${s.end_time.trim()}`);
};

// 🔥 NEW UPDATED FUNCTION (proper AM/PM support)
const isSlotInFuture = (slotEndTime) => {
  const now = new Date();
  try {
    const parsedEnd = parse(slotEndTime.trim(), 'h:mm a', now); // e.g., '9:00 AM' parsed properly
    return isAfter(parsedEnd, now);
  } catch (e) {
    console.error('Error parsing time:', slotEndTime, e);
    return false;
  }
};

const AreaWiseSlot = () => {
  const params = useLocalSearchParams();
  const area = params?.area || '';
  const router = useRouter();
  const navigation = useNavigation();

  const [userEmail, setUserEmail] = useState(null);
  const [slots, setSlots] = useState([]);
  const [filteredSlots, setFilteredSlots] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(generateDates()[0].fullDate);
  const [refreshing, setRefreshing] = useState(false);
  const [bestSlotKeys, setBestSlotKeys] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const dates = generateDates(7);

  const fetchUser = async () => {
    try {
      const user = await AsyncStorage.getItem('loggedInUser');
      if (user) {
        const userData = JSON.parse(user);
        setUserEmail(userData?.email || '');
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const fetchSlots = useCallback(async () => {
    if (!area) {
      Alert.alert("Error", "Invalid area data.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://192.168.254.253:5000/slots/available/${encodeURIComponent(area)}/${selectedDate}`);
      const data = await response.json();

      if (!Array.isArray(data)) {
        console.error("Invalid slots data format:", data);
        setSlots([]);
        setBestSlotKeys([]);
      } else {
        let processedSlots = data;

        if (isToday(new Date(selectedDate))) {
          processedSlots = data.filter(slot => {
            const endTime = slot.end_time?.trim();
            return endTime ? isSlotInFuture(endTime) : false;
          });
        }

        setSlots(processedSlots);
        setFilteredSlots(processedSlots);
        setSelectedSlots([]);
        const bestKeys = getBestSlots(processedSlots);
        setBestSlotKeys(bestKeys);
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
      Alert.alert("Error", "Failed to load slot details.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [area, selectedDate]);

  useEffect(() => {
    fetchUser();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchSlots();
    }, [fetchSlots])
  );

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSlots();
  };

  const toggleSlotSelection = (slot) => {-
    if (slot.isBooked) return;

    const isSelected = selectedSlots.find(
      (s) =>
        s.start_time.trim() === slot.start_time.trim() &&
        s.end_time.trim() === slot.end_time.trim()
    );

    if (isSelected) {
      setSelectedSlots((prev) =>
        prev.filter(
          (s) =>
            !(s.start_time.trim() === slot.start_time.trim() &&
              s.end_time.trim() === slot.end_time.trim())
        )
      );
    } else {
      setSelectedSlots((prev) => [...prev, slot]);
    }
  };

  const handleProceedToBook = () => {
    if (!userEmail) {
      Alert.alert("Login Required", "Please log in to book slots.");
      return;
    }

    if (selectedSlots.length === 0) {
      Alert.alert("No Slot Selected", "Please select at least one slot.");
      return;
    }

    const slotTimes = selectedSlots
      .map((slot) => `${slot.start_time} - ${slot.end_time}`)
      .join(', ');
    const totalPrice = selectedSlots.reduce((sum, slot) => sum + slot.price, 0);

    router.push({
      pathname: '/BookingForm',
      params: {
        area: area.toString(),
        slotTime: slotTimes,
        price: totalPrice.toString(),
        date: selectedDate,
      },
    });
  };

  const filterSlots = (text) => {
    setSearchTerm(text);
    const lower = text.toLowerCase();
    let filtered = slots.filter(
      (slot) =>
        slot.start_time.toLowerCase().includes(lower) ||
        slot.end_time.toLowerCase().includes(lower)
    );

    if (minPrice) {
      filtered = filtered.filter(slot => slot.price >= parseFloat(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter(slot => slot.price <= parseFloat(maxPrice));
    }

    setFilteredSlots(filtered);
  };

  const applyPriceFilter = () => {
    filterSlots(searchTerm);
    setShowFilterModal(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Pressable onPress={() => navigation.goBack()} style={styles.headerIcon}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </Pressable>
        <Text style={styles.headerTitle}>{area}</Text>
        <View style={styles.headerRight}>
          <Pressable onPress={() => setShowFilterModal(true)}>
            <Ionicons name="options" size={22} color="black" />
          </Pressable>
        </View>
      </View>

      <View style={styles.searchBarContainer}>
        <TextInput
          placeholder="Search time (e.g. 8:00)"
          value={searchTerm}
          onChangeText={filterSlots}
          style={styles.searchBar}
        />
      </View>

      <View style={styles.dateContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {dates.map((d, idx) => {
            const isSelected = selectedDate === d.fullDate;
            return (
              <Pressable
                key={idx}
                onPress={() => setSelectedDate(d.fullDate)}
                style={[styles.dateItem, isSelected && styles.dateItemSelected]}
              >
                <Text style={[styles.dateDay, isSelected && styles.dateTextSelected]}>{d.day}</Text>
                <Text style={[styles.dateNumber, isSelected && styles.dateTextSelected]}>{d.date}</Text>
                <Text style={[styles.dateMonth, isSelected && styles.dateTextSelected]}>{d.month}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView style={styles.slotScroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {loading ? (
          <ActivityIndicator size="large" color="blue" />
        ) : filteredSlots.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 20, fontSize: 16, color: 'gray' }}>
            No slots available.
          </Text>
        ) : (
          <View style={styles.slotContainer}>
            {filteredSlots.map((slot, idx) => {
              const isBooked = slot.isBooked;
              const slotKey = `${slot.start_time.trim()}-${slot.end_time.trim()}`;
              const isSelected = selectedSlots.some(
                (s) =>
                  s.start_time.trim() === slot.start_time.trim() &&
                  s.end_time.trim() === slot.end_time.trim()
              );
              const bestSlot = bestSlotKeys.includes(slotKey);

              return (
                <Pressable
                  key={idx}
                  disabled={isBooked}
                  onPress={() => toggleSlotSelection(slot)}
                  style={[
                    styles.slotCard,
                    isBooked && styles.slotBooked,
                    isSelected && styles.slotSelected,
                    bestSlot && !isBooked && styles.slotBest,
                  ]}
                >
                  <Text style={[styles.slotText, (isBooked || isSelected) && styles.slotBookedText]}>
                    {slot.start_time.trim()} - {slot.end_time.trim()}
                  </Text>
                  <Text style={[styles.slotText, (isBooked || isSelected) && styles.slotBookedText]}>
                    ₹{slot.price}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>

      {selectedSlots.length > 0 && (
        <View style={styles.buttonContainer}>
          <Pressable style={styles.proceedButton} onPress={handleProceedToBook}>
            <Text style={styles.proceedButtonText}>
              Book {selectedSlots.length} Slot{selectedSlots.length > 1 ? 's' : ''}
            </Text>
          </Pressable>
        </View>
      )}

      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#E5E7EB' }]} />
          <Text style={styles.legendText}>Booked</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#fff', borderColor: '#10B981', borderWidth: 1 }]} />
          <Text style={styles.legendText}>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { borderColor: 'orange', borderWidth: 2 }]} />
          <Text style={styles.legendText}>Best</Text>
        </View>
      </View>

      <Modal visible={showFilterModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: '#000000aa', justifyContent: 'center' }}>
          <View style={{ backgroundColor: '#fff', padding: 20, borderRadius: 10, margin: 20 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>Filter by Price</Text>
            <TextInput
              placeholder="Min Price"
              keyboardType="numeric"
              value={minPrice}
              onChangeText={setMinPrice}
              style={{ borderBottomWidth: 1, marginBottom: 10 }}
            />
            <TextInput
              placeholder="Max Price"
              keyboardType="numeric"
              value={maxPrice}
              onChangeText={setMaxPrice}
              style={{ borderBottomWidth: 1, marginBottom: 20 }}
            />
            <Pressable onPress={applyPriceFilter} style={{ backgroundColor: '#2563EB', padding: 10, borderRadius: 8 }}>
              <Text style={{ color: '#fff', textAlign: 'center' }}>Apply Filter</Text>
            </Pressable>
            <Pressable onPress={() => setShowFilterModal(false)} style={{ marginTop: 15 }}>
              <Text style={{ textAlign: 'center', color: 'red' }}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};




const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    justifyContent: 'space-between',
  },
  headerIcon: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  searchBarContainer: { paddingHorizontal: 16, paddingBottom: 6 },
  searchBar: {
    backgroundColor: '#f1f1f1',
    padding: 10,
    borderRadius: 10,
  },
  dateContainer: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  dateItem: {
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    borderRadius: 10,
  },
  dateItemSelected: {
    backgroundColor: '#EF4444',
  },
  dateDay: { fontSize: 12, color: '#9CA3AF' },
  dateMonth: { fontSize: 12, color: '#9CA3AF' },
  dateNumber: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  dateTextSelected: { color: '#fff' },
  slotScroll: { flex: 1, padding: 16 },
  slotContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  slotCard: {
    width: '30%',
    marginVertical: 6,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderColor: '#10B981',
    borderWidth: 1,
  },
  slotBooked: {
    backgroundColor: '#E5E7EB',
    borderColor: '#D1D5DB',
  },
  slotBookedText: { color: '#9CA3AF' },
  slotSelected: {
    backgroundColor: '#10B981',
    borderColor: '#047857',
  },
  slotBest: {
    borderColor: 'orange',
    borderWidth: 2,
  },
  slotText: {
    fontSize: 12,
    color: '#000',
    fontWeight: '500',
    textAlign: 'center',
  },
  buttonContainer: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  proceedButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  proceedButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
    alignItems: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 20,
    height: 20,
    marginRight: 5,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#000',
  },
});

export default AreaWiseSlot;
