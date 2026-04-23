import React, { useState } from 'react';
import { TextInput, Button, StyleSheet, Alert, View, Clipboard, TouchableOpacity, Text, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function VerifyPage() {
  const [code, setCode] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);
  const router = useRouter();

  const handleVerifyCode = async () => {
    try {
      const storedCode = await AsyncStorage.getItem('verificationCode');

      if (storedCode === code) {
        alert( 'Verification successful!');
        router.push('/ResetPasswordPage');
      } else {
        alert( 'Invalid verification code');
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      alert( 'Something went wrong. Please try again.');
    }
  };

  const handleCopyCode = async () => {
    try {
      const storedCode = await AsyncStorage.getItem('verificationCode');
      if (storedCode) {
        Clipboard.setString(storedCode);
        setCopiedCode(storedCode);
        alert( 'Verification code copied to clipboard!');
      } else {
        alert('No verification code found.');
      }
    } catch (error) {
      console.error('Error copying code:', error);
      alert('Something went wrong. Please try again.');
    }
  };

  return (
    <ImageBackground
      source={require('../assets/images/b.jpg')} // Replace with your image path
      style={styles.background}
    >
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Enter verification code"
          placeholderTextColor="#fff" // Ensure placeholder is visible
          value={code}
          onChangeText={setCode}
        />
        <Button title="Verify Code" onPress={handleVerifyCode} />
        <TouchableOpacity style={styles.copyButton} onPress={handleCopyCode}>
          <Text style={styles.copyText}>Copy Verification Code</Text>
        </TouchableOpacity>
        {copiedCode && (
          <Text style={styles.copiedText}>Copied Code: {copiedCode}</Text>
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Optional: Add semi-transparent overlay for better text visibility
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    color: '#fff', // Ensure input text is visible
  },
  copyButton: {
    marginTop: 16,
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 4,
    alignItems: 'center',
  },
  copyText: {
    color: '#fff',
    fontSize: 16,
  },
  copiedText: {
    marginTop: 12,
    color: '#fff',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
