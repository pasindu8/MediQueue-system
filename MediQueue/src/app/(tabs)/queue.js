import React, { useState, useEffect, useCallback } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPatientAppointmentDetails } from '../../services/appointmentsService';

export default function LiveQueueScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeAppointment, setActiveAppointment] = useState(null);

  const fetchLiveQueueData = useCallback(async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        setLoading(false);
        return;
      }

      const response = await getPatientAppointmentDetails(userId.trim());

      if (response.ok && response.data) {
        const appt = response.data.appointment || (Array.isArray(response.data) ? response.data[0] : null);
        setActiveAppointment(appt);
      } else {
        setActiveAppointment(null);
      }
    } catch (error) {
      console.error('Error fetching live queue:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveQueueData();
    const interval = setInterval(fetchLiveQueueData, 4000);
    return () => clearInterval(interval);
  }, [fetchLiveQueueData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLiveQueueData();
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#0B5338" />
        <Text style={{ marginTop: 10, color: '#64748B' }}>Connecting to Live Hospital Queue...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* 1. Top Header */}
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.subHeaderTitle}>REAL-TIME OPD TRACKER</Text>
          <Text style={styles.mainHeaderTitle}>LIVE QUEUE</Text>
        </View>
        <TouchableOpacity
          style={styles.notificationButton}
          activeOpacity={0.8}
          onPress={() => router.push('/appointments/QrScan')}
        >
          <Ionicons name="qr-code-outline" size={20} color="#0B5338" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0B5338']} />
        }
      >
        {activeAppointment ? (
          <>
            {/* 2. Circular Queue Status Dial */}
            <View style={styles.dialContainer}>
              <View style={styles.outerRing}>
                <View style={styles.innerDial}>
                  <Text style={styles.dialTokenTitle}>YOUR ACTIVE TOKEN</Text>
                  <Text style={styles.dialTokenNumber}>
                    {activeAppointment.tokenNumber || 'A 001'}
                  </Text>

                  <View style={styles.dialStatusRow}>
                    <View
                      style={[
                        styles.greenDot,
                        activeAppointment.status === 'completed' && { backgroundColor: '#2563EB' },
                      ]}
                    />
                    <Text style={styles.dialWaitText}>
                      {activeAppointment.status === 'completed'
                        ? ' Consultation Completed'
                        : ' Waiting in Queue'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* 3. Now Calling & Destination Card */}
            <View style={styles.nowCallingCard}>
              <View>
                <View style={styles.rowCentered}>
                  <View style={styles.smallGreenDot} />
                  <Text style={styles.nowCallingCardLabel}>CLINIC & DOCTOR</Text>
                </View>
                <Text style={styles.nowCallingCardNumber}>
                  {activeAppointment.clinicName || 'General OPD Clinic'}
                </Text>
                <Text style={styles.hospitalSubText}>
                  {activeAppointment.hospitalName || 'District General Hospital - Kalutara'}
                </Text>
              </View>
              <View style={styles.roomContainerRight}>
                <Text style={styles.roomLabelText}>DESK / ROOM</Text>
                <Text style={styles.roomNumberText}>
                  {activeAppointment.roomNumber || 'Room 03'}
                </Text>
              </View>
            </View>

            {/* 4. Queue Progress Section */}
            <View style={styles.progressSectionCard}>
              <View style={styles.progressHeaderRow}>
                <Text style={styles.progressTitle}>Queue Status</Text>
                <Text style={styles.progressServedText}>
                  {activeAppointment.status === 'completed' ? 'Done' : 'Serving Today'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Appointment Date</Text>
                <Text style={styles.infoValue}>
                  {activeAppointment.appointmentDate
                    ? new Date(activeAppointment.appointmentDate).toLocaleDateString('en-GB')
                    : 'Today'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Check-in Time</Text>
                <Text style={styles.infoValue}>
                  {activeAppointment.appointmentTime || 'Morning OPD'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Current Status</Text>
                <Text
                  style={[
                    styles.infoValue,
                    {
                      color:
                        activeAppointment.status === 'completed' ? '#2563EB' : '#0B5338',
                      fontWeight: '800',
                    },
                  ]}
                >
                  {activeAppointment.status === 'completed' ? 'Completed' : 'Scheduled & Active'}
                </Text>
              </View>
            </View>

            {/* 5. Next Steps Guidance */}
            <View style={styles.estimatedCard}>
              <View style={styles.clockIconContainer}>
                <Ionicons
                  name={activeAppointment.status === 'completed' ? 'checkmark-circle' : 'time-outline'}
                  size={24}
                  color="#2563EB"
                />
              </View>
              <View style={styles.estimatedTextContainer}>
                <Text style={styles.estWaitLabel}>Instructions</Text>
                <Text style={styles.estWaitTime}>
                  {activeAppointment.status === 'completed'
                    ? 'Check Pharmacy tab for your prescribed medications'
                    : 'Please wait near the clinic waiting area until your token is called'}
                </Text>
              </View>
            </View>
          </>
        ) : (
          /* Empty State when no appointment in queue */
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="people-outline" size={44} color="#0B5338" />
            </View>
            <Text style={styles.emptyTitle}>No Active Appointments in Queue</Text>
            <Text style={styles.emptySubtitle}>
              You do not have any pending appointments in the hospital queue right now.
            </Text>

            <TouchableOpacity
              style={styles.actionBtn}
              activeOpacity={0.85}
              onPress={() => router.push('/appointments/QrScan')}
            >
              <Ionicons name="qr-code-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.actionBtnText}>Scan Desk QR at Hospital</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.secondaryBtn]}
              activeOpacity={0.85}
              onPress={() => router.push('/appointments/NewToken')}
            >
              <Ionicons name="calendar-outline" size={20} color="#0B5338" style={{ marginRight: 8 }} />
              <Text style={styles.secondaryBtnText}>Book Appointment Token</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  subHeaderTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00C853',
    letterSpacing: 1,
  },
  mainHeaderTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  notificationButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  dialContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
  outerRing: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 6,
    borderColor: '#E2F8EE',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3FCF7',
  },
  innerDial: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialTokenTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
    letterSpacing: 0.5,
  },
  dialTokenNumber: {
    fontSize: 48,
    fontWeight: '900',
    color: '#0F172A',
    marginVertical: 2,
  },
  dialStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00C853',
  },
  dialWaitText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  nowCallingCard: {
    backgroundColor: '#0B5338',
    borderRadius: 18,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  rowCentered: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  smallGreenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00C853',
    marginRight: 6,
  },
  nowCallingCardLabel: {
    fontSize: 11,
    color: '#A7F3D0',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  nowCallingCardNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  hospitalSubText: {
    fontSize: 11.5,
    color: '#E2E8F0',
    marginTop: 2,
    maxWidth: 200,
  },
  roomContainerRight: {
    alignItems: 'flex-end',
  },
  roomLabelText: {
    fontSize: 11,
    color: '#A7F3D0',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  roomNumberText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  progressSectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  progressServedText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0B5338',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  estimatedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  clockIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  estimatedTextContainer: {
    flex: 1,
  },
  estWaitLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#2563EB',
    textTransform: 'uppercase',
  },
  estWaitTime: {
    fontSize: 13,
    color: '#475569',
    marginTop: 2,
    lineHeight: 18,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E6F4EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    maxWidth: 290,
  },
  actionBtn: {
    backgroundColor: '#0B5338',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    marginBottom: 12,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryBtn: {
    backgroundColor: '#E6F4EA',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  secondaryBtnText: {
    color: '#0B5338',
    fontSize: 14,
    fontWeight: '700',
  },
});