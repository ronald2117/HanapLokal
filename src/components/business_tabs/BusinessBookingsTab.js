import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { collection, query, where, getDocs, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { useLanguage } from '../../contexts/LanguageContext'; // Corrected import
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../styles/theme';

const BusinessBookingsTab = ({ store, navigation, isMyStore = false }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchBookings();
  }, [store.id]);

  const fetchBookings = async () => {
    try {
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where(isMyStore ? 'storeId' : 'userId', '==', isMyStore ? store.id : currentUser.uid)
      );
      const querySnapshot = await getDocs(bookingsQuery);
      const bookingsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBookings(bookingsData);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      Alert.alert(t('error'), t('failedToFetchBookings'));
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async () => {
    try {
      await addDoc(collection(db, 'bookings'), {
        storeId: store.id,
        userId: currentUser.uid,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      Alert.alert(t('success'), t('bookingRequestSent'));
      fetchBookings();
    } catch (error) {
      console.error("Error booking appointment:", error);
      Alert.alert(t('error'), t('failedToBook'));
    }
  };
  
  const handleDelete = (bookingId) => {
    Alert.alert(
      t('deleteBooking'),
      t('areYouSureDeleteBooking'),
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('delete'), style: 'destructive', onPress: () => deleteBooking(bookingId) },
      ]
    );
  };

  const deleteBooking = async (bookingId) => {
    try {
      await deleteDoc(doc(db, 'bookings', bookingId));
      fetchBookings(); // Refresh the list
      Alert.alert(t('success'), t('bookingDeletedSuccess'));
    } catch (error) {
      console.error("Error deleting booking:", error);
      Alert.alert(t('error'), t('failedToDeleteBooking'));
    }
  };

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>{t('loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!isMyStore && (
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleBookAppointment}
        >
          <Ionicons name="calendar-outline" size={24} color={Colors.background.primary} />
          <Text style={styles.addButtonText}>{t('bookAppointment')}</Text>
        </TouchableOpacity>
      )}

      {bookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={64} color={Colors.text.light} />
          <Text style={styles.emptyText}>{t('noBookingsAvailable')}</Text>
        </View>
      ) : (
        bookings.map(item => (
          <View key={item.id} style={styles.bookingCard}>
            <View style={styles.bookingInfo}>
              <Text style={styles.bookingText}>{isMyStore ? `Booking from: ${item.userId}` : `Booking with: ${store.name}`}</Text>
              <Text style={styles.bookingStatus}>{`Status: ${item.status}`}</Text>
            </View>
            {isMyStore && (
              <View style={styles.actionsContainer}>
                <TouchableOpacity onPress={() => navigation.navigate('EditBooking', { booking: item, storeId: store.id })}>
                  <Ionicons name="pencil-outline" size={24} color={Colors.secondary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                  <Ionicons name="trash-outline" size={24} color={Colors.error} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))
      )}
    </View>
  );
};

export default BusinessBookingsTab;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.base,
    backgroundColor: Colors.background.secondary,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.sm,
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    ...Shadows.base,
  },
  addButtonText: {
    color: Colors.text.white,
    marginLeft: Spacing.sm,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  bookingCard: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.base,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...Shadows.base,
  },
  bookingInfo: {
    flex: 1,
  },
  bookingText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
  },
  bookingStatus: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary,
    marginTop: Spacing.sm,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.text.light,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
});

