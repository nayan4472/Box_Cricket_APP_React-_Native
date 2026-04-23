import React, { useEffect, useState } from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
    Text,
    Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';

export default function ProfilePage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const loggedInUser = await AsyncStorage.getItem('loggedInUser');
                if (loggedInUser) {
                    const userData = JSON.parse(loggedInUser);
                    setUsername(userData.username);
                    setEmail(userData.email);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, []);

    const handleUpdate = async () => {
        if (!username || !email) {
            alert('All fields are required.');
            return;
        }
    
        try {
            // Get and update the accounts stored in AsyncStorage
            const accounts = await AsyncStorage.getItem('accounts');
            const parsedAccounts = accounts ? JSON.parse(accounts) : [];
            const updatedAccounts = parsedAccounts.map((account) => {
                if (account.email === email) {
                    return { ...account, username, email };
                }
                return account;
            });
    
            // Update accounts in AsyncStorage
            await AsyncStorage.setItem('accounts', JSON.stringify(updatedAccounts));
    
            // Update logged in user
            const updatedUser = { username, email };
            await AsyncStorage.setItem('loggedInUser', JSON.stringify(updatedUser));
    
            // Show success alert before redirecting
            alert('Profile updated successfully!');
    
            // After success, redirect to LoginPage
            router.push('/LoginPage');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Something went wrong. Please try again.');
        }
    };
    

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('loggedInUser');
            setModalVisible(false);
            alert('Logged out successfully!');
            router.push('/HomePage');
        } catch (error) {
            console.error('Error logging out:', error);
            alert('Unable to logout. Please try again.');
        }
    };

    return (
        <ImageBackground
            source={require('../assets/images/b.jpg')}
            style={styles.background}
        >
            <View style={styles.container}>
                {/* Big Profile Icon */}
                <View style={styles.avatarContainer}>
                    <Icon name="person-circle-outline" size={120} color="#4e8bed" />
                    <Text style={styles.profileTitle}>My Profile</Text>
                </View>

                {/* Username Input */}
                <View style={styles.inputContainer}>
                    <Icon name="person-outline" size={22} color="#4e8bed" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Username"
                        value={username}
                        onChangeText={setUsername}
                        placeholderTextColor="#666"
                    />
                </View>

                {/* Email Input */}
                <View style={styles.inputContainer}>
                    <Icon name="mail-outline" size={22} color="#4e8bed" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        placeholderTextColor="#666"
                    />
                </View>

                {/* Update Profile Button */}
                <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
                    <Icon name="save-outline" size={22} color="#fff" style={styles.buttonIcon} />
                    <Text style={styles.updateButtonText}>Update Profile</Text>
                </TouchableOpacity>

                {/* Change Password Button */}
                <TouchableOpacity style={styles.changePasswordButton} onPress={() => router.push('/ChangePassword')}>
                    <Icon name="key-outline" size={22} color="#4e8bed" style={styles.buttonIcon} />
                    <Text style={styles.changePasswordText}>Change Password</Text>
                </TouchableOpacity>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={() => setModalVisible(true)}>
                    <Icon name="log-out-outline" size={22} color="#fff" style={styles.buttonIcon} />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>

                {/* Logout Confirmation Modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalText}>Are you sure you want to logout?</Text>
                            <View style={styles.modalButtonContainer}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Text style={styles.buttonText}>No</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.confirmButton]}
                                    onPress={handleLogout}
                                >
                                    <Text style={styles.buttonText}>Yes</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
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
        padding: 20,
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.9)',
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    profileTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#4e8bed',
        marginTop: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 18,
        backgroundColor: '#f5f7fa',
    },
    input: {
        flex: 1,
        height: 50,
        paddingHorizontal: 10,
        color: '#333',
        fontSize: 16,
    },
    icon: {
        marginRight: 8,
    },
    updateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4e8bed',
        paddingVertical: 14,
        borderRadius: 12,
        marginBottom: 14,
    },
    updateButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    buttonIcon: {
        marginRight: 8,
    },
    changePasswordButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#4e8bed',
        paddingVertical: 12,
        borderRadius: 12,
        marginBottom: 14,
    },
    changePasswordText: {
        color: '#4e8bed',
        fontSize: 18,
        fontWeight: 'bold',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#d9534f',
        paddingVertical: 14,
        borderRadius: 12,
        marginTop: 10,
    },
    logoutText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: 300,
        backgroundColor: '#fff',
        padding: 25,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        flex: 1,
        marginHorizontal: 8,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: 'red',
    },
    confirmButton: {
        backgroundColor: 'green',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
