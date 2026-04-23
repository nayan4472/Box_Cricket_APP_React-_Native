import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Platform, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import AdminFooter from './AdminFooter';

const AdminBookingData = () => {
  const [bookings, setBookings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);  // Track current page
  const [bookingsPerPage] = useState(1);  // Number of bookings to display per page
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = () => {
    fetch('http://192.168.254.253:5000/allbookings')
      .then((res) => res.json())
      .then((data) => {
        console.log("Booking response data:", data);
        if (Array.isArray(data)) {
          setBookings(data);
        } else if (Array.isArray(data.bookings)) {
          setBookings(data.bookings);
        } else {
          console.warn("Unexpected data format:", data);
          alert('Invalid booking data received from server');
        }
      })
      .catch((err) => {
        console.log(err);
        alert('Failed to fetch booking data');
      });
  };

  const handleCancelBooking = (bookingId) => {
    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this booking?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes", style: "destructive", onPress: () => {
            fetch(`http://192.168.254.253:5000/cancelbooking/${bookingId}`, {
              method: "DELETE"
            })
              .then(res => res.json())
              .then(data => {
                alert(data.message || "Booking cancelled successfully");
                fetchBookings(); // refresh
              })
              .catch(err => {
                console.error(err);
                alert("Failed to cancel booking");
              });
          }
        }
      ]
    );
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('loggedInUser');
    router.push('/LoginPage');
  };

  const confirmLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to logout?')) {
        handleLogout();
      }
    } else {
      Alert.alert('Logout Confirmation', 'Are you sure you want to logout?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: handleLogout }
      ]);
    }
  };

  // Get current bookings to display based on the page
  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = bookings.slice(indexOfFirstBooking, indexOfLastBooking);

  // Pagination buttons
  const nextPage = () => {
    if (currentPage < Math.ceil(bookings.length / bookingsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {/* Header */}
        <AdminHeader toggleSidebar={() => setSidebarVisible(!sidebarVisible)} />

        {/* Sidebar */}
        <AdminSidebar visible={sidebarVisible} closeSidebar={() => setSidebarVisible(false)} />

        {/* Main Content */}
        <ScrollView style={styles.scroll}>
          <View style={styles.mainContent}>
            <Text style={styles.heading}>Booking Records</Text>

            {currentBookings.map((booking, index) => (
              <View key={index} style={styles.card}>
                <Text style={styles.cardTitle}>
                  <Ionicons name="person-outline" size={18} /> {booking.name}
                </Text>
                <Text><Ionicons name="mail-outline" size={16} /> <Text style={styles.label}>Email:</Text> {booking.email}</Text>
                <Text><Ionicons name="call-outline" size={16} /> <Text style={styles.label}>Mobile:</Text> {booking.mobile}</Text>
                <Text><Ionicons name="location-outline" size={16} /> <Text style={styles.label}>Area:</Text> {booking.area}</Text>
                <Text><Ionicons name="time-outline" size={16} /> <Text style={styles.label}>Slot Time:</Text> {booking.slotTime}</Text>
                <Text><Ionicons name="pricetag-outline" size={16} /> <Text style={styles.label}>Price:</Text> ₹{booking.price}</Text>
                <Text><Ionicons name="wallet-outline" size={16} /> <Text style={styles.label}>Advance Payment:</Text> ₹{booking.advancePayment}</Text>
                <Text><Ionicons name="cash-outline" size={16} /> <Text style={styles.label}>Due Amount:</Text> ₹{booking.dueAmount}</Text>
                <Text><Ionicons name="calendar-outline" size={16} /> <Text style={styles.label}>Booking Date:</Text> {booking.bookingDate}</Text>

                <TouchableOpacity
                  onPress={() => handleCancelBooking(booking._id)}
                  style={styles.cancelButton}
                >
                  <Ionicons name="close-circle-outline" size={20} color="white" />
                  <Text style={styles.cancelButtonText}>Cancel Booking</Text>
                </TouchableOpacity>
              </View>
            ))}

            {/* Pagination buttons */}
            <View style={styles.pagination}>
              <TouchableOpacity onPress={prevPage} disabled={currentPage === 1} style={styles.paginationButton}>
                <Text style={styles.paginationButtonText}>Previous</Text>
              </TouchableOpacity>
              <Text style={styles.pageNumber}>{`Page ${currentPage}`}</Text>
              <TouchableOpacity onPress={nextPage} disabled={currentPage === Math.ceil(bookings.length / bookingsPerPage)} style={styles.paginationButton}>
                <Text style={styles.paginationButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Footer */}
      <AdminFooter />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#007bff',
  },
  label: {
    fontWeight: '600',
    color: '#333',
  },
  cancelButton: {
    marginTop: 12,
    backgroundColor: '#dc3545',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  paginationButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#007bff',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  paginationButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  pageNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default AdminBookingData;
