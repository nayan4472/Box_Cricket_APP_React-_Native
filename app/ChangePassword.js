import React, { useState } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    Text,
    StyleSheet,
    Alert,
    ImageBackground,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';

export default function ChangePassword() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const router = useRouter();

    const handleChangePassword = async () => {
        if (!newPassword || !confirmPassword) {
            Alert.alert('Error', 'Both fields are required.');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match.');
            return;
        }

        try {
            const loggedInUser = await AsyncStorage.getItem('loggedInUser');
            if (!loggedInUser) {
                Alert.alert('Error', 'User not found.');
                return;
            }

            const userData = JSON.parse(loggedInUser);
            const email = userData.email;

            const accounts = await AsyncStorage.getItem('accounts');
            const parsedAccounts = accounts ? JSON.parse(accounts) : [];

            const updatedAccounts = parsedAccounts.map((account) => {
                if (account.email === email) {
                    return { ...account, password: newPassword };
                }
                return account;
            });

            await AsyncStorage.setItem('accounts', JSON.stringify(updatedAccounts));

            const updatedUser = { ...userData, password: newPassword };
            await AsyncStorage.setItem('loggedInUser', JSON.stringify(updatedUser));

            Alert.alert('Success', 'Password updated successfully!');
            router.push('/ProfilePage');
        } catch (error) {
            console.error('Error updating password:', error);
            Alert.alert('Error', 'Something went wrong. Please try again.');
        }
    };

    return (
        <ImageBackground
            source={require('../assets/images/b.jpg')}
            style={styles.background}
        >
            <View style={styles.container}>
                {/* New Password Field */}
                <View style={styles.inputContainer}>
                    <Icon name="lock-closed-outline" size={22} color="#4e8bed" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="New Password"
                        secureTextEntry={!showNewPassword}
                        value={newPassword}
                        onChangeText={setNewPassword}
                        placeholderTextColor="#666"
                    />
                    <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                        <Icon
                            name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                            size={22}
                            color="#999"
                        />
                    </TouchableOpacity>
                </View>

                {/* Confirm Password Field */}
                <View style={styles.inputContainer}>
                    <Icon name="lock-closed-outline" size={22} color="#4e8bed" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Confirm Password"
                        secureTextEntry={!showConfirmPassword}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholderTextColor="#666"
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                        <Icon
                            name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                            size={22}
                            color="#999"
                        />
                    </TouchableOpacity>
                </View>

                {/* Button */}
                <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
                    <Icon name="save-outline" size={22} color="#fff" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>Change Password</Text>
                </TouchableOpacity>
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
        padding: 20,
        backgroundColor: 'rgba(255,255,255,0.9)',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f7fa',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 18,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    input: {
        flex: 1,
        height: 50,
        fontSize: 16,
        color: '#333',
        paddingHorizontal: 10,
    },
    icon: {
        marginRight: 8,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4e8bed',
        paddingVertical: 14,
        borderRadius: 12,
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    buttonIcon: {
        marginRight: 8,
    },
});
