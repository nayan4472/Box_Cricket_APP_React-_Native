import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, Alert,
  StyleSheet, ScrollView, Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import AdminFooter from './AdminFooter';

export default function AdminManageSlot() {
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [price, setPrice] = useState('');
  const [slots, setSlots] = useState([]);
  const [editingSlot, setEditingSlot] = useState(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [page, setPage] = useState(1); // State to track the current page
  const [slotsPerPage] = useState(3); // Number of slots per page
  const router = useRouter();

  useEffect(() => {
    fetchAreas();
    fetchSlots();
  }, []);

  const fetchAreas = async () => {
    try {
      const response = await fetch(`http://192.168.254.253:5000/areas/all`);
      const data = await response.json();
      setAreas(data);
    } catch (error) {
      alert('Failed to fetch areas');
    }
  };

  const fetchSlots = async () => {
    try {
      const response = await fetch(`http://192.168.254.253:5000/slots/all`);
      const data = await response.json();
      setSlots(data);
    } catch (error) {
      alert('Failed to fetch slots');
    }
  };

  const handleAddOrUpdateSlot = async () => {
    if (!selectedArea || !startTime || !endTime || !price) {
      alert('Please fill all fields');
      return;
    }

    const url = editingSlot
      ? `http://192.168.254.253:5000/slots/update/${editingSlot._id}`
      : `http://192.168.254.253:5000/slots/add`;

    const method = editingSlot ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          area: selectedArea,
          start_time: startTime,
          end_time: endTime,
          price: parseFloat(price)
        })
      });

      if (response.ok) {
        alert(`Slot ${editingSlot ? 'updated' : 'added'} successfully`);
        setEditingSlot(null);
        setStartTime('');
        setEndTime('');
        setPrice('');
        fetchSlots();
      } else {
        alert('Failed to save slot');
      }
    } catch (error) {
      alert('Error saving slot');
    }
  };

  const handleEditSlot = (slot) => {
    setEditingSlot(slot);
    setSelectedArea(slot.area);
    setStartTime(slot.start_time);
    setEndTime(slot.end_time);
    setPrice(slot.price.toString());
  };

  const handleDeleteSlot = async (id) => {
    try {
      await fetch(`http://192.168.254.253:5000/slots/delete/${id}`, {
        method: 'DELETE'
      });
      alert('Slot deleted successfully');
      fetchSlots();
    } catch (error) {
      alert('Failed to delete slot');
    }
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

  const onTimeChange = (event, selectedDate, type) => {
    if (selectedDate) {
      const formattedTime = selectedDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
      if (type === 'start') {
        setStartTime(formattedTime);
      } else {
        setEndTime(formattedTime);
      }
    }
    setShowStartPicker(false);
    setShowEndPicker(false);
  };

  // Pagination logic to slice the slots array
  const paginatedSlots = slots.slice((page - 1) * slotsPerPage, page * slotsPerPage);

  return (
    <View style={styles.container}>
      <AdminHeader toggleSidebar={() => setSidebarVisible(!sidebarVisible)} />

      {/* Sidebar */}
      <AdminSidebar visible={sidebarVisible} closeSidebar={() => setSidebarVisible(false)} />

      {/* Scrollable Main Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.heading}>Manage Slots</Text>

        <View style={styles.formContainer}>
          <Picker selectedValue={selectedArea} onValueChange={setSelectedArea} style={[styles.input,{height:'20px'}]}>
            <Picker.Item label="Select Area" value="" />
            {areas.map((area) => (
              <Picker.Item key={area._id} label={area.name} value={area.name} />
            ))}
          </Picker>

          <TouchableOpacity style={styles.input} onPress={() => setShowStartPicker(true)}>
            <Text>{startTime ? `Start Time: ${startTime}` : 'Select Start Time'}</Text>
          </TouchableOpacity>
          {showStartPicker && (
            <DateTimePicker
              mode="time"
              value={new Date()}
              is24Hour={false}
              display="default"
              onChange={(event, date) => onTimeChange(event, date, 'start')}
            />
          )}

          <TouchableOpacity style={styles.input} onPress={() => setShowEndPicker(true)}>
            <Text>{endTime ? `End Time: ${endTime}` : 'Select End Time'}</Text>
          </TouchableOpacity>
          {showEndPicker && (
            <DateTimePicker
              mode="time"
              value={new Date()}
              is24Hour={false}
              display="default"
              onChange={(event, date) => onTimeChange(event, date, 'end')}
            />
          )}

          <TextInput
            style={styles.input}
            value={price}
            onChangeText={setPrice}
            placeholder="Price"
            keyboardType="numeric"
          />

          <TouchableOpacity style={styles.addButton} onPress={handleAddOrUpdateSlot}>
            <Text style={styles.buttonText}>{editingSlot ? 'Update Slot' : 'Add Slot'}</Text>
          </TouchableOpacity>
        </View>

        {/* Slots Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderCell}>Area</Text>
            <Text style={styles.tableHeaderCell}>Time</Text>
            <Text style={styles.tableHeaderCell}>Price</Text>
            <Text style={styles.tableHeaderCell}>Actions</Text>
          </View>
          {paginatedSlots.map((item) => (
            <View key={item._id} style={styles.tableRow}>
              <Text style={styles.tableCell}>{item.area}</Text>
              <Text style={styles.tableCell}>{item.start_time} - {item.end_time}</Text>
              <Text style={styles.tableCell}>₹{item.price}</Text>
              <View style={styles.actionButtons}>
                <TouchableOpacity onPress={() => handleEditSlot(item)}>
                  <Ionicons name="create-outline" size={20} color="blue" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteSlot(item._id)}>
                  <Ionicons name="trash-outline" size={20} color="red" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Pagination Controls */}
        <View style={styles.paginationControls}>
          <TouchableOpacity
            style={[styles.paginationButton, page === 1 && styles.disabledButton]}
            onPress={() => setPage(page - 1)}
            disabled={page === 1}
          >
            <Text style={styles.paginationText}>Previous</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paginationButton, page * slotsPerPage >= slots.length && styles.disabledButton]}
            onPress={() => setPage(page + 1)}
            disabled={page * slotsPerPage >= slots.length}
          >
            <Text style={styles.paginationText}>Next</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <AdminFooter />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4' },
  scrollContent: { padding: 20 },
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  formContainer: { marginBottom: 20 },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 5,
    padding: 10, fontSize: 16, backgroundColor: 'white', marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#007bff', paddingVertical: 12, borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  table: {
    backgroundColor: 'white', borderRadius: 5,
    overflow: 'hidden', elevation: 2,
  },
  tableHeader: { flexDirection: 'row', backgroundColor: '#007bff', paddingVertical: 10 },
  tableHeaderCell: { flex: 1, color: 'white', fontWeight: 'bold', textAlign: 'center' },
  tableRow: {
    flexDirection: 'row', paddingVertical: 10,
    borderBottomWidth: 1, borderColor: '#ddd',
  },
  tableCell: { flex: 1, textAlign: 'center', fontSize: 16 },
  actionButtons: { flexDirection: 'row', justifyContent: 'space-around', flex: 1 },
  paginationControls: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  paginationButton: {
    paddingVertical: 10, paddingHorizontal: 20, backgroundColor: '#007bff', borderRadius: 5,
  },
  paginationText: { color: 'white', fontSize: 16 },
  disabledButton: { backgroundColor: '#ccc' },
});
