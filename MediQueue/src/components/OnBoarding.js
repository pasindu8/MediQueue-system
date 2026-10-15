import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OnboardingScreen2() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>

      {/* 2. Main Content Area */}
      <View style={styles.content}>
        <Image
          source={require('../assets/images/onboarding2.png')}
          style={styles.image}
          resizeMode="contain"
        />
        <Text style={styles.textSub}>
          {t('onboarding2')}
        </Text>
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
  skipText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  image: {
    width: 400,
    height: 400,
    alignSelf: 'center',
    marginBottom: 20,
    marginTop: -100,
  },
  textSub: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    color: '#0F172A',
    lineHeight: 28,
    paddingHorizontal: 16,
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
  nextBtn: {
    backgroundColor: '#0D9488',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    width: '100%',
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});