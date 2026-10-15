import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ErrorBanner({ visible, message, onHide }) {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(-120)).current; 

  useEffect(() => {
    if (visible) {
      
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();

      
      const timer = setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: -120,
          duration: 300,
          useNativeDriver: true,
        }).start(() => onHide && onHide());
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.bannerContainer,
        {
          paddingTop: insets.top + 8, 
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.contentRow}>
        <Ionicons name="alert-circle" size={26} color="#FFFFFF" style={styles.icon} />
        <Text style={styles.messageText}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#E52E2E', 
    paddingBottom: 14,
    paddingHorizontal: 16,
    zIndex: 9999, 
    elevation: 10,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 10,
  },
  messageText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '500',
    lineHeight: 18,
  },
});