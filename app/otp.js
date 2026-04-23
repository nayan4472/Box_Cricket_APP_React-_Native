import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const PaymentOTP = () => {
  const [otp, setOtp] = useState('');
  const router = useRouter();

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter a valid 6-digit OTP.');
      return;
    }

    try {
      const response = await fetch('http://192.168.76.253:5000/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp })
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('Payment Successful', 'Your booking has been confirmed!');
        router.replace('/');
      } else {
        Alert.alert('OTP Verification Failed', data.message || 'Incorrect OTP.');
      }
    } catch (error) {
      console.error('OTP Verification Error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔑 Enter OTP</Text>
      <Text style={styles.subtitle}>We've sent an OTP to your registered mobile number.</Text>
      <TextInput
        style={styles.input}
        placeholder='Enter OTP'
        keyboardType='numeric'
        maxLength={6}
        value={otp}
        onChangeText={setOtp}
      />
      <TouchableOpacity style={styles.button} onPress={handleVerifyOtp}>
        <Text style={styles.buttonText}>Verify & Confirm Payment</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#007bff', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#333', textAlign: 'center', marginBottom: 20, paddingHorizontal: 20 },
  input: { width: '80%', fontSize: 18, padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, backgroundColor: '#fff', textAlign: 'center' },
  button: { backgroundColor: '#28a745', padding: 15, borderRadius: 8, marginTop: 20 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default PaymentOTP;
