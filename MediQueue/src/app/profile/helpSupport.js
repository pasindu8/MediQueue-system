import React, { useState } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function HelpSupportScreen() {
  const [expandedFaq, setExpandedFaq] = useState(null);

  // දුරකථන ඇමතුම් ලබා ගැනීම සඳහා
  const handleMakeCall = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`).catch(() => {
      Alert.alert('Error', 'Unable to initiate phone call on this device.');
    });
  };

  // විද්‍යුත් තැපෑලක් යැවීම සඳහා
  const handleSendEmail = () => {
    Linking.openURL('mailto:support@mediqueue.lk?subject=MediQueue Support Request').catch(() => {
      Alert.alert('Error', 'No email app found on device.');
    });
  };

  // FAQ ප්‍රශ්න සහ පිළිතුරු
  const faqs = [
    {
      id: 1,
      question: 'How do I obtain an OPD queue token?',
      answer:
        'Tap "New Token" from the home dashboard, select your required clinic department (e.g., OPD, Dental), and your token number will be generated immediately.',
    },
    {
      id: 2,
      question: 'What should I do if I miss my token call?',
      answer:
        'If your number has been called and missed, your token will remain held for 10 minutes. Visit the clinic reception desk to be re-added to the current batch.',
    },
    {
      id: 3,
      question: 'Can I view the queue status while offline?',
      answer:
        'Yes. If your mobile internet drops, the app switches to offline cache mode and sends essential room movement alerts via SMS to your registered phone number.',
    },
    {
      id: 4,
      question: 'Where can I collect my pharmacy prescription?',
      answer:
        'Once your consultation is finished, check the Notification section. You will receive an alert specifying the exact Counter Number when medication is ready.',
    },
  ];

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Emergency Assistance Notice */}
        <View style={styles.emergencyCard}>
          <View style={styles.emergencyHeader}>
            <Ionicons name="warning" size={22} color="#DC2626" />
            <Text style={styles.emergencyTitle}>Medical Emergency?</Text>
          </View>
          <Text style={styles.emergencySubtitle}>
            If you or the patient are facing an immediate medical emergency, please dial the national ambulance line directly.
          </Text>
          <TouchableOpacity
            style={styles.emergencyCallBtn}
            onPress={() => handleMakeCall('1990')}
            activeOpacity={0.85}
          >
            <Ionicons name="call" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.emergencyBtnText}>Call 1990 Suwa Seriya</Text>
          </TouchableOpacity>
        </View>

        {/* Direct Contact Channels */}
        <Text style={styles.sectionHeading}>Contact Hospital Helpdesk</Text>
        <View style={styles.contactGrid}>
          <TouchableOpacity
            style={styles.contactCard}
            onPress={() => handleMakeCall('0112345678')}
            activeOpacity={0.75}
          >
            <View style={styles.contactIconWrap}>
              <Ionicons name="headset-outline" size={22} color="#0D9488" />
            </View>
            <Text style={styles.contactCardTitle}>OPD Helpline</Text>
            <Text style={styles.contactCardSub}>Direct Line (24/7)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactCard}
            onPress={handleSendEmail}
            activeOpacity={0.75}
          >
            <View style={styles.contactIconWrap}>
              <Ionicons name="mail-outline" size={22} color="#0D9488" />
            </View>
            <Text style={styles.contactCardTitle}>Email Support</Text>
            <Text style={styles.contactCardSub}>Response in 24h</Text>
          </TouchableOpacity>
        </View>

        {/* Physical Helpdesk Location */}
        <View style={styles.locationCard}>
          <Ionicons name="location-outline" size={20} color="#0F3A5D" />
          <View style={{ flex: 1 }}>
            <Text style={styles.locationTitle}>Physical Help Desk</Text>
            <Text style={styles.locationSub}>
              Counter 01, Ground Floor Main OPD Lobby, General Hospital.
            </Text>
          </View>
        </View>

        {/* FAQs Accordion */}
        <Text style={styles.sectionHeading}>Frequently Asked Questions</Text>
        <View style={styles.faqList}>
          {faqs.map((faq) => {
            const isOpen = expandedFaq === faq.id;
            return (
              <View key={faq.id} style={styles.faqCard}>
                <TouchableOpacity
                  style={styles.faqQuestionRow}
                  onPress={() => toggleFaq(faq.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.faqQuestionText}>{faq.question}</Text>
                  <Ionicons
                    name={isOpen ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color="#64748B"
                  />
                </TouchableOpacity>

                {isOpen && (
                  <View style={styles.faqAnswerContainer}>
                    <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDF5FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 40,
  },
  emergencyCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  emergencyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#991B1B',
  },
  emergencySubtitle: {
    fontSize: 12.5,
    color: '#7F1D1D',
    lineHeight: 18,
    marginBottom: 12,
  },
  emergencyCallBtn: {
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  emergencyBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contactGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  contactCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  contactIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0FDFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactCardTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  contactCardSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 22,
  },
  locationTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  locationSub: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
  },
  faqList: {
    gap: 10,
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  faqQuestionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  faqQuestionText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
    paddingRight: 10,
  },
  faqAnswerContainer: {
    paddingHorizontal: 15,
    paddingBottom: 15,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  faqAnswerText: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 18,
    marginTop: 6,
  },
});