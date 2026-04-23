import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, Modal, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';

const colorOptions = [
  { label: 'Blue', value: '#007bff' },
  { label: 'Red', value: '#dc3545' },
  { label: 'Green', value: '#28a745' },
  { label: 'Orange', value: '#fd7e14' },
  { label: 'Purple', value: '#6f42c1' },
  { label: 'Black', value: '#000000' },
];

const defaultAdminColors = {
  headerColor: '#007bff',
  footerColor: '#007bff',
  sidebarColor: '#007bff',
};

const defaultUserColors = {
  headerColor: '#007bff',
  footerColor: '#007bff',
};

const AdminSettings = () => {
  const [headerColor, setHeaderColor] = useState(defaultAdminColors.headerColor);
  const [footerColor, setFooterColor] = useState(defaultAdminColors.footerColor);
  const [sidebarColor, setSidebarColor] = useState(defaultAdminColors.sidebarColor);
  const [userHeaderColor, setUserHeaderColor] = useState(defaultUserColors.headerColor);
  const [userFooterColor, setUserFooterColor] = useState(defaultUserColors.footerColor);
  const [showModal, setShowModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false); // State for Reset Confirmation Modal
  const navigation = useNavigation();

  useEffect(() => {
    const loadColors = async () => {
      const savedHeader = await AsyncStorage.getItem('headerColor');
      const savedFooter = await AsyncStorage.getItem('footerColor');
      const savedSidebar = await AsyncStorage.getItem('sidebarColor');
      const savedUserHeader = await AsyncStorage.getItem('userHeaderColor');
      const savedUserFooter = await AsyncStorage.getItem('userFooterColor');

      setHeaderColor(savedHeader || defaultAdminColors.headerColor);
      setFooterColor(savedFooter || defaultAdminColors.footerColor);
      setSidebarColor(savedSidebar || defaultAdminColors.sidebarColor);
      setUserHeaderColor(savedUserHeader || defaultUserColors.headerColor);
      setUserFooterColor(savedUserFooter || defaultUserColors.footerColor);
    };
    loadColors();
  }, []);

  const saveColors = async () => {
    await AsyncStorage.setItem('headerColor', headerColor);
    await AsyncStorage.setItem('footerColor', footerColor);
    await AsyncStorage.setItem('sidebarColor', sidebarColor);
    await AsyncStorage.setItem('userHeaderColor', userHeaderColor);
    await AsyncStorage.setItem('userFooterColor', userFooterColor);
    setShowModal(false);
    Alert.alert('Success', 'Colors updated!', [
      { text: 'OK', onPress: () => navigation.navigate('LoginPage') },
    ]);
  };

  const resetColors = async () => {
    setHeaderColor(defaultAdminColors.headerColor);
    setFooterColor(defaultAdminColors.footerColor);
    setSidebarColor(defaultAdminColors.sidebarColor);
    setUserHeaderColor(defaultUserColors.headerColor);
    setUserFooterColor(defaultUserColors.footerColor);
    await AsyncStorage.removeItem('headerColor');
    await AsyncStorage.removeItem('footerColor');
    await AsyncStorage.removeItem('sidebarColor');
    await AsyncStorage.removeItem('userHeaderColor');
    await AsyncStorage.removeItem('userFooterColor');
    setShowResetModal(false);
    Alert.alert('Reset', 'Colors have been reset to default!', [
      { text: 'OK', onPress: () => navigation.navigate('LoginPage') },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Admin Settings</Text>

      <Text style={styles.description}>
        Customize the header, footer, and sidebar colors for your application. Choose your desired colors from the
        options below, and save the settings for a personalized experience.
      </Text>

      <Text style={styles.label}>Select Admin Header Color:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={headerColor}
          onValueChange={(value) => setHeaderColor(value)}
          style={styles.picker}
        >
          {colorOptions.map((color) => (
            <Picker.Item
              key={color.value}
              label={color.label}
              value={color.value}
              color={color.value}
            />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Select Admin Footer Color:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={footerColor}
          onValueChange={(value) => setFooterColor(value)}
          style={styles.picker}
        >
          {colorOptions.map((color) => (
            <Picker.Item
              key={color.value}
              label={color.label}
              value={color.value}
              color={color.value}
            />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Select Admin Sidebar Color:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={sidebarColor}
          onValueChange={(value) => setSidebarColor(value)}
          style={styles.picker}
        >
          {colorOptions.map((color) => (
            <Picker.Item
              key={color.value}
              label={color.label}
              value={color.value}
              color={color.value}
            />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Select User Header Color:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={userHeaderColor}
          onValueChange={(value) => setUserHeaderColor(value)}
          style={styles.picker}
        >
          {colorOptions.map((color) => (
            <Picker.Item
              key={color.value}
              label={color.label}
              value={color.value}
              color={color.value}
            />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Select User Footer Color:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={userFooterColor}
          onValueChange={(value) => setUserFooterColor(value)}
          style={styles.picker}
        >
          {colorOptions.map((color) => (
            <Picker.Item
              key={color.value}
              label={color.label}
              value={color.value}
              color={color.value}
            />
          ))}
        </Picker>
      </View>

      <View style={styles.previewContainer}>
        <Text style={styles.previewLabel}>Current Color Preview:</Text>
        <View style={[styles.previewBox, { backgroundColor: headerColor }]} >
          <Text style={styles.previewText}>Admin Header Color</Text>
        </View>
        <View style={[styles.previewBox, { backgroundColor: footerColor }]} >
          <Text style={styles.previewText}>Admin Footer Color</Text>
        </View>
        <View style={[styles.previewBox, { backgroundColor: sidebarColor }]} >
          <Text style={styles.previewText}>Admin Sidebar Color</Text>
        </View>
        <View style={[styles.previewBox, { backgroundColor: userHeaderColor }]} >
          <Text style={styles.previewText}>User Header Color</Text>
        </View>
        <View style={[styles.previewBox, { backgroundColor: userFooterColor }]} >
          <Text style={styles.previewText}>User Footer Color</Text>
        </View>
      </View>

      <View style={styles.buttonGrid}>
        <TouchableOpacity style={styles.saveButton} onPress={() => setShowModal(true)}>
          <Text style={styles.saveButtonText}>Save Colors</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.resetButton} onPress={() => setShowResetModal(true)}>
          <Text style={styles.resetButtonText}>Reset to Default</Text>
        </TouchableOpacity>
      </View>

      {/* Modal for confirmation */}
      <Modal transparent={true} visible={showModal} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Save</Text>
            <Text style={styles.modalMessage}>Are you sure you want to save these color settings?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={saveColors}
              >
                <Text style={styles.modalButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal for reset confirmation */}
      <Modal transparent={true} visible={showResetModal} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Reset</Text>
            <Text style={styles.modalMessage}>Are you sure you want to reset the colors to default?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowResetModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={resetColors}
              >
                <Text style={styles.modalButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Manage your settings for a better experience!</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginTop: 15,
    marginBottom: 5,
    color: '#333',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 20,
  },
  picker: {
    height: 50,
    color: '#333',
  },
  previewContainer: {
    marginTop: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  previewBox: {
    width: '80%',
    padding: 20,
    borderRadius: 8,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
    marginBottom: 15,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resetButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
    marginBottom: 15,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#888',
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalMessage: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: '45%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#dc3545',
  },
  confirmButton: {
    backgroundColor: '#28a745',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AdminSettings;
