import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import HeaderComponent from './HeaderComponent';
import FooterComponent from './FooterComponent';


export default function MyBooking() {
  const [bookings, setBookings] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const loggedInUser = await AsyncStorage.getItem('loggedInUser');
        if (!loggedInUser) {
          setLoading(false);
          return;
        }

        const user = JSON.parse(loggedInUser);
        setUserEmail(user.email);
        setIsLoggedIn(true);

        const response = await fetch(`http://192.168.76.253:5000/userBookings?email=${user.email}`);
        if (!response.ok) {
          throw new Error('Failed to fetch bookings');
        }

        const data = await response.json();
        setBookings(data.bookings || []);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const confirmCancelBooking = (booking) => {
    setSelectedBooking(booking);
    setModalVisible(true);
  };

  const cancelBooking = async () => {
    if (!selectedBooking || !selectedBooking._id) {
      alert('Invalid booking ID.');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`http://192.168.76.253:5000/cancelBooking/${selectedBooking._id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to cancel booking');
      }

      setBookings((prevBookings) => prevBookings.filter(b => b._id !== selectedBooking._id));
      alert('Booking canceled successfully!');
      setModalVisible(false);
    } catch (error) {
      alert('Could not cancel booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <HeaderComponent isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <Text style={styles.title}>My Bookings</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : bookings.length === 0 ? (
        <Text style={styles.noBookingText}>Sorry...! No bookings found.</Text>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.area}</Text>
              <Text style={styles.cardText}><Text style={styles.bold}>Booked By:</Text> {item.name}</Text>
              <Text style={styles.cardText}><Text style={styles.bold}>Email:</Text> {item.email}</Text>
              <Text style={styles.cardText}><Text style={styles.bold}>Slot Time:</Text> {item.slotTime}</Text>
              <Text style={styles.cardText}><Text style={styles.bold}>Date:</Text> {item.date}</Text>
              <Text style={styles.cardText}><Text style={styles.bold}>Total Price:</Text> ₹{item.price}</Text>
              <Text style={styles.cardText}><Text style={styles.bold}>Advance Payment:</Text> ₹{item.advancePayment}</Text>
              <Text style={styles.cardText}><Text style={styles.bold}>Due Amount:</Text> ₹{item.dueAmount}</Text>
              <TouchableOpacity style={styles.cancelButton} onPress={() => confirmCancelBooking(item)}>
                <Text style={styles.cancelButtonText}>Cancel Booking</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <Modal transparent visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Cancel Booking?</Text>
            <Text style={styles.modalText}>Are you sure you want to cancel this booking?</Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalButtonCancel}>
                <Text style={styles.modalButtonText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={cancelBooking} style={styles.modalButtonConfirm}>
                <Text style={styles.modalButtonText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <FooterComponent />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333' },
  noBookingText: { textAlign: 'center', fontSize: 18, color: 'red' },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 15, elevation: 4 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: '#2b2b2b' },
  cardText: { fontSize: 16, color: '#333', marginBottom: 5 },
  bold: { fontWeight: 'bold' },
  cancelButton: { backgroundColor: '#d9534f', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  cancelButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalView: { backgroundColor: 'white', padding: 20, borderRadius: 12, alignItems: 'center', width: 300 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  modalText: { fontSize: 16, marginBottom: 20 },
  modalButtonContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  modalButtonCancel: { backgroundColor: 'red', padding: 10, borderRadius: 6, flex: 1, alignItems: 'center', marginRight: 5 },
  modalButtonConfirm: { backgroundColor: 'green', padding: 10, borderRadius: 6, flex: 1, alignItems: 'center' },
  modalButtonText: { color: 'white', fontSize: 14, fontWeight: 'bold' },
});
