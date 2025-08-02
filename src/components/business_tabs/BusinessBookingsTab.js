import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { collection, query, where, getDocs, addDoc, serverTimestamp, deleteDoc, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../styles/theme';
import DateTimePicker from '@react-native-community/datetimepicker';

const BusinessBookingsTab = ({ store, navigation, isMyStore = false }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({
    service: '',
    notes: '',
  });
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { t } = useLanguage();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (store?.id) {
      fetchBookings();
    }
  }, [store.id, currentUser.uid]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'bookings'),
        where('storeId', '==', store.id),
        ...(isMyStore ? [] : [where('userId', '==', currentUser.uid)]),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const bookingsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate()?.toLocaleString() ?? 'N/A',
        };
      });
      setBookings(bookingsData);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      Alert.alert(t('error'), t('failedToFetchBookings'));
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async () => {
    if (isSubmitting) return;

    if (!bookingDetails.service) {
      Alert.alert(t('error'), 'Please provide a service.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Check for existing pending booking to prevent spam
      const q = query(
        collection(db, 'bookings'),
        where('storeId', '==', store.id),
        where('userId', '==', currentUser.uid),
        where('status', '==', 'pending')
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        Alert.alert(t('error'), 'You already have a pending booking with this business.');
        setIsSubmitting(false);
        return;
      }

      await addDoc(collection(db, 'bookings'), {
        storeId: store.id,
        storeName: store.name,
        userId: currentUser.uid,
        customerName: currentUser.displayName || 'Customer',
        status: 'pending',
        service: bookingDetails.service,
        requestedDate: date.toLocaleDateString(),
        requestedTime: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        notes: bookingDetails.notes,
        createdAt: serverTimestamp(),
      });
      Alert.alert(t('success'), t('bookingRequestSent'));
      setModalVisible(false);
      setBookingDetails({ service: '', notes: '' });
      fetchBookings();
    } catch (error) {
      console.error("Error booking appointment:", error);
      Alert.alert(t('error'), t('failedToBook'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, { status });
      Alert.alert(t('success'), `Booking has been ${status}.`);
      fetchBookings();
    } catch (error) {
      console.error(`Error updating booking to ${status}:`, error);
      Alert.alert(t('error'), `Failed to update booking.`);
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
      fetchBookings();
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

  const renderBookingCard = (item) => {
    const statusColors = {
      pending: Colors.warning,
      confirmed: Colors.success,
      cancelled: Colors.error,
      completed: Colors.info,
    };
    const statusColor = statusColors[item.status] || Colors.text.light;

    return (
      <View key={item.id} style={[styles.bookingCard, { borderLeftColor: statusColor }]}>
        <View style={styles.bookingInfo}>
          <Text style={styles.bookingService}>{item.service}</Text>
          <Text style={styles.bookingText}>
            {isMyStore ? `Customer: ${item.customerName}` : `Store: ${item.storeName}`}
          </Text>
          <Text style={styles.bookingText}>Date: {item.requestedDate} at {item.requestedTime || 'any time'}</Text>
          {item.notes ? <Text style={styles.bookingNotes}>Notes: {item.notes}</Text> : null}
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{item.status?.toUpperCase()}</Text>
          </View>
        </View>
        {isMyStore && (
          <View style={styles.actionsContainer}>
            {item.status === 'pending' && (
              <>
                <TouchableOpacity style={styles.actionButton} onPress={() => updateBookingStatus(item.id, 'confirmed')}>
                  <Ionicons name="checkmark-circle-outline" size={28} color={Colors.success} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => updateBookingStatus(item.id, 'cancelled')}>
                  <Ionicons name="close-circle-outline" size={28} color={Colors.error} />
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(item.id)}>
              <Ionicons name="trash-outline" size={24} color={Colors.text.light} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {!isMyStore && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="calendar-outline" size={24} color={Colors.text.white} />
          <Text style={styles.addButtonText}>{t('bookAppointment')}</Text>
        </TouchableOpacity>
      )}

      {bookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={64} color={Colors.text.light} />
          <Text style={styles.emptyText}>{t('noBookingsAvailable')}</Text>
        </View>
      ) : (
        bookings.map(renderBookingCard)
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Booking Request</Text>
            <TextInput
              style={styles.input}
              placeholder="Service Required (e.g., Haircut) *"
              value={bookingDetails.service}
              onChangeText={(text) => setBookingDetails({ ...bookingDetails, service: text })}
            />

            <Text style={styles.inputLabel}>Date & Time</Text>
            <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
              <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
              <Text style={styles.datePickerText}>{date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                testID="dateTimePicker"
                value={date}
                mode="datetime"
                is24Hour={false}
                display="default"
                onChange={onDateChange}
                minimumDate={new Date()}
              />
            )}

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Additional Notes"
              multiline
              value={bookingDetails.notes}
              onChangeText={(text) => setBookingDetails({ ...bookingDetails, notes: text })}
            />
            <TouchableOpacity style={[styles.modalButton, isSubmitting && styles.disabledButton]} onPress={handleBookAppointment} disabled={isSubmitting}>
              <Text style={styles.modalButtonText}>{isSubmitting ? 'Submitting...' : 'Send Request'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, styles.modalCancelButton]} onPress={() => setModalVisible(false)} disabled={isSubmitting}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    borderLeftWidth: 5,
  },
  bookingInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  bookingService: {
    fontSize: Typography.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  bookingText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  bookingNotes: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.light,
    fontStyle: 'italic',
    marginTop: Spacing.sm,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.pill,
  },
  statusText: {
    color: Colors.text.white,
    fontSize: Typography.fontSize.sm,
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  actionButton: {
    padding: Spacing.sm,
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.lg,
  },
  modalTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  input: {
    backgroundColor: Colors.background.secondary,
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.fontSize.base,
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  datePickerText: {
    fontSize: Typography.fontSize.base,
    marginLeft: Spacing.sm,
    color: Colors.text.primary,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalButton: {
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  modalCancelButton: {
    backgroundColor: Colors.text.light,
  },
  modalButtonText: {
    color: Colors.text.white,
    fontSize: Typography.fontSize.lg,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: Colors.text.light,
  },
});

