import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, RefreshControl, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import AdminFooter from './AdminFooter';

const Admin = () => {
  const router = useRouter();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [userCount, setUserCount] = useState(0);
  const [areaCount, setAreaCount] = useState(0);
  const [slotCount, setSlotCount] = useState(0);
  const [bookingCount, setBookingCount] = useState(0);
  const [totalAdvance, setTotalAdvance] = useState(0);
  const [totalDue, setTotalDue] = useState(0);

  const fetchCounts = async () => {
    setLoading(true);
    try {
      const [usersRes, areasRes, slotsRes, bookingsRes] = await Promise.all([
        fetch('http://192.168.254.253:5000/getUsers'),
        fetch('http://192.168.254.253:5000/areas/all'),
        fetch('http://192.168.254.253:5000/slots/all'),
        fetch('http://192.168.254.253:5000/allbookings'),
      ]);

      const users = await usersRes.json();
      const areas = await areasRes.json();
      const slots = await slotsRes.json();
      const bookingsData = await bookingsRes.json();

      const bookingArray = Array.isArray(bookingsData) ? bookingsData : bookingsData.bookings || [];

      setUserCount(users?.length || 0);
      setAreaCount(areas?.length || 0);
      setSlotCount(slots?.length || 0);
      setBookingCount(bookingArray?.length || 0);

      let totalAdv = 0;
      let totalDueAmt = 0;

      bookingArray.forEach(booking => {
        totalAdv += parseFloat(booking.advancePayment) || 0;
        totalDueAmt += parseFloat(booking.dueAmount) || 0;
      });

      setTotalAdvance(totalAdv);
      setTotalDue(totalDueAmt);
    } catch (error) {
      console.error("Error fetching counts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCounts().then(() => setRefreshing(false));
  }, []);

  const renderCardValue = (value, isCurrency = false, color) => {
    if (loading) {
      return <ActivityIndicator size="small" color={color || "#000"} />;
    }
    return (
      <Text style={[styles.cardCount, color ? { color } : {}]}>
        {isCurrency ? `₹${value.toFixed(2)}` : value}
      </Text>
    );
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <AdminHeader toggleSidebar={() => setSidebarVisible(!sidebarVisible)} />
        <AdminSidebar visible={sidebarVisible} closeSidebar={() => setSidebarVisible(false)} />

        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <Text style={styles.welcomeText}>Welcome, Admin!</Text>
          <View style={styles.cardContainer}>
            <TouchableOpacity style={styles.card} onPress={() => router.push('/AdminUserData')}>
              <Ionicons name="people-outline" size={30} color="#555" />
              <Text style={styles.cardTitle}>Users</Text>
              {renderCardValue(userCount)}
            </TouchableOpacity>

            <TouchableOpacity style={styles.card} onPress={() => router.push('/AdminManageAreas')}>
              <Ionicons name="map-outline" size={30} color="#555" />
              <Text style={styles.cardTitle}>Areas</Text>
              {renderCardValue(areaCount)}
            </TouchableOpacity>

            <TouchableOpacity style={styles.card} onPress={() => router.push('/AdminManageSlot')}>
              <Ionicons name="time-outline" size={30} color="#555" />
              <Text style={styles.cardTitle}>Slots</Text>
              {renderCardValue(slotCount)}
            </TouchableOpacity>

            <TouchableOpacity style={styles.card} onPress={() => router.push('/AdminBookingData')}>
              <Ionicons name="calendar-outline" size={30} color="#555" />
              <Text style={styles.cardTitle}>Bookings</Text>
              {renderCardValue(bookingCount)}
            </TouchableOpacity>

            <View style={styles.card}>
              <Ionicons name="cash-outline" size={30} color="green" />
              <Text style={styles.cardTitle}>Advance Payment</Text>
              {renderCardValue(totalAdvance, true, 'green')}
            </View>

            <View style={styles.card}>
              <Ionicons name="cash-outline" size={30} color="red" />
              <Text style={styles.cardTitle}>Due Amount</Text>
              {renderCardValue(totalDue, true, 'red')}
            </View>
          </View>
        </ScrollView>
      </View>
      <AdminFooter />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#f8f8f8' },
  container: { flex: 1 },
  content: { alignItems: 'center', padding: 20 },
  welcomeText: { fontSize: 24, fontWeight: 'bold', marginVertical: 20 },
  cardContainer: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'space-between', paddingHorizontal: 10,
  },
  card: {
    width: '47%', height: 130, backgroundColor: '#fff',
    borderRadius: 12, elevation: 4, padding: 15,
    marginVertical: 10, justifyContent: 'center', alignItems: 'center',
  },
  cardTitle: { fontSize: 16, fontWeight: '600', marginTop: 10, color: '#333' },
  cardCount: { fontSize: 22, fontWeight: 'bold', marginTop: 5, color: '#555' },
});

export default Admin;
