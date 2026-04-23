import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Animatable from 'react-native-animatable';

const UserBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  const fetchUserBooking = async () => {
    try {
      const storedValue = await AsyncStorage.getItem('loggedInUser');
      const user = JSON.parse(storedValue);
      const storedEmail = user?.email;
      setEmail(storedEmail);
      if (!storedEmail) {
        setLoading(false);
        return;
      }

      const response = await fetch(
        `http://192.168.254.253:5000/userbooking?email=${storedEmail}`
      );
      const data = await response.json();
      if (data.success && data.booking) {
        const bookingsArray = Array.isArray(data.booking)
          ? data.booking
          : [data.booking];
        setBookings(bookingsArray);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserBooking();
  }, []);

  const getFullDateTime = (dateStr, timeStr) => {
    const date = new Date(dateStr);
    const timeParts = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);

    if (!timeParts) return date; // fallback if time format doesn't match

    let [_, hour, minute, modifier] = timeParts;
    hour = parseInt(hour, 10);
    minute = parseInt(minute, 10);

    if (modifier.toUpperCase() === 'PM' && hour !== 12) hour += 12;
    if (modifier.toUpperCase() === 'AM' && hour === 12) hour = 0;

    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      hour,
      minute
    );
  };

  const handleConfirmCancel = async () => {
    try {
      const response = await fetch(
        `http://192.168.254.253:5000/cancelBooking/${selectedBookingId}`,
        { method: 'DELETE' }
      );
      const result = await response.json();

      if (result.success) {
        setShowSuccess(true);
        fetchUserBooking();
        setTimeout(() => {
          setShowSuccess(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Cancel error:', error);
    } finally {
      setShowCancelConfirm(false);
      setSelectedBookingId(null);
    }
  };

  const openCancelModal = (bookingId) => {
    setSelectedBookingId(bookingId);
    setShowCancelConfirm(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (!bookings.length) {
    return (
      <View style={styles.centered}>
        <Text style={styles.noBookingText}>No bookings found.</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>📋 Your Booking Details</Text>
        <Text style={styles.totalText}>Total Bookings: {bookings.length}</Text>

        {bookings.map((booking) => {
          const bookingTime = getFullDateTime(
            booking.bookingDate,
            booking.slotTime
          );
          const isExpired = bookingTime < new Date();

          return (
            <View key={booking._id} style={styles.card}>
              <Field label="👤 Name" value={booking.name} />
              <Field label="📧 Email" value={booking.email} />
              <Field label="📱 Mobile" value={booking.mobile} />
              <Field label="📍 Area" value={booking.area} />
              <Field label="⏳ Slot Time" value={booking.slotTime} />
              <Field
                label="📅 Booking Date"
                value={formatDate(booking.bookingDate)}
              />
              <Field
                label="💰 Price"
                value={`₹${booking.price?.toFixed(2)}`}
              />
              <Field
                label="💵 Advance Paid"
                value={`₹${booking.advancePayment?.toFixed(2)}`}
                color="green"
              />
              <Field
                label="🔻 Due Amount"
                value={`₹${booking.dueAmount?.toFixed(2)}`}
                color="red"
              />

             

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => openCancelModal(booking._id)}
              >
                <Text style={styles.cancelButtonText}>Cancel Booking</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>

      {/* Success Modal */}
      <Modal
        transparent
        visible={showSuccess}
        animationType="fade"
        onRequestClose={() => setShowSuccess(false)}
      >
        <View style={styles.modalOverlay}>
          <Animatable.View
            animation="bounceIn"
            duration={800}
            style={styles.successBox}
          >
            <Text style={styles.successText}>✅ Booking Cancelled!</Text>
          </Animatable.View>
        </View>
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal
        transparent
        visible={showCancelConfirm}
        animationType="slide"
        onRequestClose={() => setShowCancelConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmBox}>
            <Text style={styles.confirmTitle}>Cancel Booking?</Text>
            <Text style={styles.confirmMessage}>
              Are you sure you want to cancel this booking?
            </Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.confirmButton, { backgroundColor: '#28a745' }]}
                onPress={handleConfirmCancel}
              >
                <Text style={styles.confirmText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, { backgroundColor: '#dc3545' }]}
                onPress={() => setShowCancelConfirm(false)}
              >
                <Text style={styles.confirmText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const Field = ({ label, value, color = '#555' }) => (
  <>
    <Text style={styles.label}>{label}</Text>
    <Text style={[styles.value, { color }]}>{value}</Text>
  </>
);

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#007bff',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
    color: '#333',
  },
  value: {
    fontSize: 16,
    marginTop: 2,
  },
  noBookingText: {
    fontSize: 18,
    color: '#ff3b30',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  cancelButton: {
    backgroundColor: '#ff3b30',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 25,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  expiredText: {
    color: 'red',
    fontWeight: 'bold',
    marginTop: 12,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successBox: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
  },
  successText: {
    fontSize: 20,
    color: 'green',
    fontWeight: 'bold',
  },
  confirmBox: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 16,
    width: '80%',
    alignItems: 'center',
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  confirmMessage: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  confirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UserBooking;
