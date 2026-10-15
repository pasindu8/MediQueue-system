import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react'; 
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getPatientAppointmentDetails } from '../../services/appointmentsService'; 
import { getHospitalDetails } from '../../services/hospitalService';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function AppointmentsScreen() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [appointment, setAppointment] = useState([]);
  const [hospitalDetails, setHospitalDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');

        if (!storedUserId) {
          return;
        }

        setLoading(true);

        const appointmentResult = await getPatientAppointmentDetails(storedUserId.trim());

        if (appointmentResult.ok && appointmentResult.data) {
          const apptData = appointmentResult.data.appointment;
          const appointments = Array.isArray(apptData)
            ? apptData.filter(Boolean)
            : apptData
              ? [apptData]
              : [];

          setAppointment(appointments);

          if (appointments[0]?.hospitalId) {
            const hospitalId = String(appointments[0].hospitalId).trim();
            const hospitalResult = await getHospitalDetails(hospitalId);

            if (hospitalResult.ok && hospitalResult.data) {
              setHospitalDetails(hospitalResult.data.hospital);
            } else {
              console.error('Error fetching hospital details:', {
                status: hospitalResult.status,
                data: hospitalResult.data,
              });
            }
          }
        } else if (appointmentResult.status === 404) {
          // A user without a completed patient profile has no appointments yet.
          setAppointment([]);
        } else {
          console.error('Error fetching appointment data:', {
            status: appointmentResult.status,
            data: appointmentResult.data,
          });
          setAppointment([]);
        }
      } catch (error) {
        console.error('Error fetching dashboard patient data:', error);
        Alert.alert(
          'Connection Error',
          'Unable to sync profile details from the server.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Appointments</Text>
      </View>

      {/* Top Segmented Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'upcoming' && styles.tabButtonActive]}
          onPress={() => setActiveTab('upcoming')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}>
            Upcoming
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'history' && styles.tabButtonActive]}
          onPress={() => setActiveTab('history')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            History
          </Text>
        </TouchableOpacity>
      </View>

      {/* Appointments List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'upcoming' && appointment && appointment.length > 0 ? (
          appointment.map((item, index) => (
            <View key={item._id || index} style={styles.appointmentCard}>
              <View style={styles.dateHeader}>
                <Ionicons name="calendar-outline" size={18} color="#0E6649" style={styles.dateIcon} />
                <Text style={styles.dateText}>
                  {item.appointmentDate ? item.appointmentDate.split('T')[0] : '----'}
                </Text>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                  <Ionicons name="time-outline" size={16} color="#64748B" />
                  <Text style={styles.infoLabel}>Time:</Text>
                  <Text style={styles.infoValue}>{item.appointmentTime || '----'}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="person-outline" size={16} color="#64748B" />
                  <Text style={styles.infoLabel}>Token:</Text>
                  <Text style={styles.infoValue}>{item.tokenNumber || '----'}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="business-outline" size={16} color="#64748B" />
                  <Text style={styles.infoLabel}>Clinic:</Text>
                  <Text style={styles.infoValue}>
                    {hospitalDetails?.clinics?.clinicName || '-----'}
                  </Text>
                </View>
              </View>

              <View style={styles.cardDivider} />

              <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
                  <Text style={styles.rescheduleText}>Reschedule</Text>
                </TouchableOpacity>

                <View style={styles.buttonDivider} />

                <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color="#94A3B8" />
            <Text style={styles.emptyStateText}>No upcoming appointments found</Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fabButton}
        activeOpacity={0.85}
        onPress={() => router.push('/appointments/NewToken')}
      >
          <Ionicons name="add" size={22} color="#FFFFFF" />
          <Text style={styles.fabText}>New Token</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDF5FA',
  },
  header: {
    backgroundColor: '#0B5338',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#0E6649',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#0E6649',
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
  },
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F4EA',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  dateIcon: {
    marginRight: 8,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0E6649',
  },
  cardBody: {
    padding: 16,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748B',
    marginLeft: 8,
    marginRight: 4,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  rescheduleText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0D9488',
  },
  buttonDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E2E8F0',
  },
  cancelText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#DC2626',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  fabButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: '#0D9488',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 30,
    elevation: 6,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    gap: 6,
    zIndex: 999,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});