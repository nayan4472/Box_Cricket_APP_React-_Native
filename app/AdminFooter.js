import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AdminFooter = () => {
  const [footerColor, setFooterColor] = useState('#007bff');

  useEffect(() => {
    const getFooterColor = async () => {
      const storedColor = await AsyncStorage.getItem('footerColor');
      if (storedColor) setFooterColor(storedColor);
    };
    getFooterColor();
  }, []);

  return (
    <View style={[styles.footer, { backgroundColor: footerColor }]}>
      <Text style={styles.footerText}>© 2025 Box Cricket Admin</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    padding: 10,
    alignItems: 'center',
  },
  footerText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default AdminFooter;
