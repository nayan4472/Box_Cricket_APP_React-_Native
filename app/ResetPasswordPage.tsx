import React, { useState } from 'react';
import {
  TextInput,
  Button,
  StyleSheet,
  Alert,
  View,
  ImageBackground,
  TouchableOpacity
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const router = useRouter();

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Both fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert ('Passwords do not match');
      return;
    }

    try {
      const email = await AsyncStorage.getItem('resetEmail');
      const accounts = await AsyncStorage.getItem('accounts');
      const parsedAccounts = accounts ? JSON.parse(accounts) : [];

      const updatedAccounts = parsedAccounts.map((account: { email: string | null; }) => {
        if (account.email === email) {
          return { ...account, password: newPassword };
        }
        return account;
      });

      await AsyncStorage.setItem('accounts', JSON.stringify(updatedAccounts));

      alert('Password reset successfully!');
      router.push('/LoginPage');
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('Something went wrong. Please try again.');
    }
  };

  return (
    <ImageBackground
      source={require('../assets/images/b.jpg')} // Replace with the actual path to your image
      style={styles.background}
    >
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <Icon name="lock" size={20} color="#fff" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="New Password"
            placeholderTextColor="#fff"
            secureTextEntry={!newPasswordVisible}
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TouchableOpacity
            onPress={() => setNewPasswordVisible(!newPasswordVisible)}
          >
            <Icon
              name={newPasswordVisible ? 'eye' : 'eye-slash'}
              size={20}
              color="#fff"
              style={styles.eyeIcon}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Icon name="lock" size={20} color="#fff" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#fff"
            secureTextEntry={!confirmPasswordVisible}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity
            onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
          >
            <Icon
              name={confirmPasswordVisible ? 'eye' : 'eye-slash'}
              size={20}
              color="#fff"
              style={styles.eyeIcon}
            />
          </TouchableOpacity>
        </View>

        <Button title="Reset Password" onPress={handleResetPassword} />
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  icon: {
    marginHorizontal: 8,
  },
  input: {
    flex: 1,
    height: 40,
    color: '#fff',
  },
  eyeIcon: {
    marginHorizontal: 8,
  },
});