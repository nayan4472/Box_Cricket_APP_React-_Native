import React, { useState } from 'react';
import { TextInput, Button, StyleSheet, Alert, View,ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const router = useRouter();

  const handleSendCode = async () => {
    if (!email) {
      alert('Please enter your email');
      return;
    }

    try {
      const accounts = await AsyncStorage.getItem('accounts');
      const parsedAccounts = accounts ? JSON.parse(accounts) : [];

      const userExists = parsedAccounts.some((account: { email: string; }) => account.email === email);
      if (!userExists) {
        alert('Email not found');
        return;
      }

      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      await AsyncStorage.setItem('verificationCode', verificationCode);
      await AsyncStorage.setItem('resetEmail', email);

      alert( `Verification code sent: ${verificationCode}`); // Replace this with actual email logic
      router.push('/VerifyPage');
    } catch (error) {
      console.error('Error sending verification code:', error);
      alert( 'Something went wrong. Please try again.');
    }
  };

  return (
    <ImageBackground
        source={require('../assets/images/b.jpg')}
        style={styles.background}
      >
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
         placeholderTextColor="#fff" 
        value={email}
        onChangeText={setEmail}
      />
      <Button title="Send Verification Code" onPress={handleSendCode} />
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
    
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    color:'white',
  },
});
