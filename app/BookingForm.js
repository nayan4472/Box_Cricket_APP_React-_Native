import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Alert, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Modal, ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useConfirmPayment, CardField } from '@stripe/stripe-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const BookingForm = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { confirmPayment } = useConfirmPayment();

  const [user, setUser] = useState({ name: '', email: '' });
  const [mobile, setMobile] = useState('');
  const [advancePayment, setAdvancePayment] = useState('0');
  const [dueAmount, setDueAmount] = useState(0);
  const [area, setArea] = useState('');
  const [slotTime, setSlotTime] = useState('');
  const [price, setPrice] = useState(0);
  const [clientSecret, setClientSecret] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showLoader, setShowLoader] = useState(false);  // For full-page loader

  const [bookingDate, setBookingDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    if (!params?.area || !params?.slotTime || !params?.price) {
      Alert.alert('Error', 'Invalid booking details.');
      router.replace('/');
      return;
    }

    setArea(params.area);
    setSlotTime(params.slotTime);
    const parsedPrice = parseFloat(params.price) || 0;
    setPrice(parsedPrice);

    if (params?.date) {
      const parsedDate = new Date(params.date);
      setSelectedDate(parsedDate);
      setBookingDate(parsedDate.toISOString().split('T')[0]);
    }
  }, []);

  useEffect(() => {
    const getUserDetails = async () => {
      try {
        const loggedInUser = await AsyncStorage.getItem('loggedInUser');
        if (loggedInUser) {
          const userData = JSON.parse(loggedInUser);
          setUser({ name: userData?.username || '', email: userData?.email || '' });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    getUserDetails();
  }, []);

  useEffect(() => {
    const advance = parseFloat(advancePayment);
    if (!isNaN(advance)) {
      setDueAmount(Math.max(price - advance, 0));
    } else {
      setDueAmount(price);
    }
  }, [advancePayment, price]);

  useEffect(() => {
    const formatted = selectedDate.toISOString().split('T')[0];
    if (formatted !== bookingDate) {
      setBookingDate(formatted);
    }
  }, [selectedDate]);

  const handleAdvancePaymentChange = (text) => {
    setAdvancePayment(text);
  };

  const handleDateChange = (event, selected) => {
    if (selected) {
      setSelectedDate(selected);
    }
    setShowDatePicker(false);
  };

  const handlePayment = async () => {
    if (!mobile.trim() || mobile.length !== 10) {
      Alert.alert('Validation Error', 'Please enter a valid 10-digit mobile number.');
      return;
    }

    const advance = parseFloat(advancePayment);
    if (isNaN(advance) || advance <= 0) {
      Alert.alert('Invalid Payment', 'Please enter a valid advance payment amount.');
      return;
    }

    if (!user.name || !user.email || !area || !slotTime || !price) {
      Alert.alert('Validation Error', 'Missing required booking details.');
      return;
    }

    if (!bookingDate.trim()) {
      Alert.alert('Validation Error', 'Please select a valid booking date.');
      return;
    }

    setShowLoader(true);  // Show the full-page loader
    setIsProcessing(true);

    try {
      const amountInPaise = advance * 100;

      const response = await fetch('http://192.168.254.253:5000/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amountInPaise, currency: 'INR' }),
      });

      const data = await response.json();
      if (!data.clientSecret) throw new Error('Missing client secret');
      setClientSecret(data.clientSecret);

      const { error, paymentIntent } = await confirmPayment(data.clientSecret, {
        paymentMethodType: 'Card',
      });

      if (error) {
        Alert.alert('Payment Failed', error.message);
      } else if (paymentIntent?.status === 'Succeeded') {
        const bookingDetails = {
          name: user.name,
          email: user.email,
          mobile: mobile.trim(),
          area: area.trim(),
          slotTime: slotTime.trim(),
          price: Number(price),
          advancePayment: Number(advance),
          dueAmount: Number(dueAmount),
          bookingDate: bookingDate.trim(),
        };

        const saveRes = await fetch('http://192.168.254.253:5000/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookingDetails),
        });

        const saveData = await saveRes.json();
        if (!saveRes.ok) throw new Error(saveData.message || 'Failed to book');

        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
          setShowLoader(false);  // Hide the loader after success
          router.replace('/UserBooking');
        }, 2000);
      }
    } catch (error) {
      console.error('Booking Error:', error);
      Alert.alert('Error', error.message || 'Something went wrong with the payment or booking.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
      keyboardVerticalOffset={80}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>🏏 Booking Form</Text>

        <View style={styles.selectedSlot}>
          <Text style={styles.slotText}>📍 Area: {area}</Text>
          <Text style={styles.slotText}>⏳ Slot Time: {slotTime}</Text>
          <Text style={styles.slotText}>💰 Price: ₹{price.toFixed(2)}</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>👤 Name:</Text>
          <Text style={styles.input}>{user.name}</Text>
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>📧 Email:</Text>
          <Text style={styles.input}>{user.email}</Text>
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>📱 Mobile:</Text>
          <TextInput
            style={styles.input}
            placeholder='Enter your mobile number'
            keyboardType='phone-pad'
            value={mobile}
            onChangeText={setMobile}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>📅 Booking Date:</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input} disabled>
            <Text>{bookingDate || 'Select date'}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              minimumDate={new Date()}
              onChange={handleDateChange}
            />
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>💵 Advance Payment:</Text>
          <TextInput
            style={styles.input}
            placeholder='Enter advance payment amount'
            keyboardType='numeric'
            value={advancePayment}
            onChangeText={handleAdvancePaymentChange}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>🔻 Due Amount: ₹{dueAmount.toFixed(2)}</Text>
        </View>

        <View style={styles.cardInputContainer}>
          <Text style={styles.label}>💳 Enter Card Details:</Text>
          <CardField
            postalCodeEnabled={false}
            placeholders={{ number: '4242 4242 4242 4242' }}
            cardStyle={{
              backgroundColor: '#FFFFFF',
              textColor: '#000000',
              fontSize: 16,
              placeholderColor: '#A9A9A9',
            }}
            style={styles.cardContainer}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, isProcessing && { opacity: 0.7 }]}
          onPress={handlePayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              Confirm Booking & Pay ₹{parseFloat(advancePayment) > 0
                ? parseFloat(advancePayment).toFixed(2)
                : dueAmount.toFixed(2)}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <Modal transparent visible={showSuccessModal} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.successText}>✅ Booking Confirmed!</Text>
            <Text style={{ textAlign: 'center', color: '#333' }}>Thank you for your booking.</Text>
          </View>
        </View>
      </Modal>

      {/* Full Page Loader */}
      {showLoader && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loaderText}>Processing  payment...</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

export default BookingForm;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#007bff',
  },
  selectedSlot: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  slotText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  staticInput: {
    fontSize: 16,
    padding: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
  },
  input: {
    fontSize: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  cardInputContainer: {
    marginBottom: 20,
  },
  cardContainer: {
    height: 50,
    marginTop: 5,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    backgroundColor: '#fff', padding: 25, borderRadius: 15, alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6, elevation: 10,
  },
  successText: {
    fontSize: 20, fontWeight: 'bold', color: 'green', marginBottom: 10,
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  loaderText: {
    marginTop: 10,
    color: '#fff',
    fontSize: 18,
  }
});
