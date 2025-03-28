import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import OrderHistory from './components/orderHistory';

export default function OrderHistoryScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <OrderHistory />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F3E6',
  },
}); 