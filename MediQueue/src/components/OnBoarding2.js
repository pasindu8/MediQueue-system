import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OnboardingScreen2() {
  const router = useRouter();
  const { t } = useTranslation();

  const handleLearnMore = () => {
    Alert.alert(
      'About MediQueue',
      'MediQueue is a digital hospital queue management system designed to streamline OPD and clinic visits.\n\n' +
      '• Live Token Tracking: Check your queue status and estimated waiting time in real time.\n' +
      '• Easy OPD Booking: Reserve clinic tokens without standing in long lines.\n' +
      '• SMS Notifications: Receive instant updates regarding token status and doctor availability.\n' +
      '• Digital Records: Keep track of upcoming hospital appointments securely.',
      [
        {
          text: 'Got it',
          style: 'default',
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* 2. Main Content Area */}
      <View style={styles.content}>
        <Image
          source={require('../assets/images/mediqueue.png')}
          style={styles.image}
          resizeMode="contain"
        />
        
        <Text style={styles.obt1s}>
          {t('obt1')}
        </Text>
        <Text style={styles.obt2s}>
          {t('obt2')}
        </Text>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.replace('/Register')}
          activeOpacity={0.85}
        >
              <Text style={styles.primaryBtnText}>{t('obt3')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.primaryBtn1}
          onPress={() => router.replace('/LoginNIC')}
          activeOpacity={0.85}
        >
              <Text style={styles.primaryBtnText}>{t('obt4')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.primaryBtn2}
          onPress={handleLearnMore}
          activeOpacity={0.85}
        >
              <Text style={styles.primaryBtnText2}>{t('obt5')}</Text>
        </TouchableOpacity>

      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  image: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginBottom: 20,
    marginTop: -100,
  },
  obt1s: {
    fontSize: 30,
    fontWeight: '900',
    textAlign: 'center',
    color: '#0F172A',
    lineHeight: 38,
    marginBottom: 40,
  },
  obt2s: {
    fontSize: 18,
    fontWeight: '400',
    textAlign: 'center',
    color: '#64748B',
    lineHeight: 24,
    marginBottom: 40,
  },
   primaryBtn2: {
    backgroundColor: '#ffffff',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  primaryBtnText2: {
    color: '#0073ff',
    fontSize: 16,
    fontWeight: '700',
  },
  primaryBtn: {
    backgroundColor: '#0D9488',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
  },
  primaryBtn1: {
    backgroundColor: '#0033b3',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#1b57fb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  footer: {
    width: '100%',
    gap: 20,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  inactiveDot: {
    width: 8,
    backgroundColor: '#93C5FD',
  },
  activeDot: {
    width: 24,
    backgroundColor: '#5B45E0',
  },
  learnMoreBtn: {
    marginTop: 18,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'center',
  },
  learnMoreText: {
    fontSize: 13.5,
    color: '#0066FF',
    fontWeight: '600',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});