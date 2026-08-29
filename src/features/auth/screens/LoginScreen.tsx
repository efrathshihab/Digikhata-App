import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { LogoMark } from '../components/LogoMark';
import { LoginForm } from '../components/LoginForm';

export const LoginScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Decorative gradient blob at the top */}
          <View pointerEvents="none" style={styles.topBlobWrapper}>
            <LinearGradient
              colors={['rgba(37,99,235,0.08)', 'rgba(37,99,235,0)']}
              style={styles.topBlob}
            />
          </View>

          <View style={styles.contentWrapper}>
            {/* Branding */}
            <View style={styles.brandContainer}>
              <LogoMark size={56} />
              <View style={styles.brandTextContainer}>
                <Text style={styles.brandName}>DigiKhata</Text>
                <Text style={styles.brandTagline}>লজিস্টিকস ম্যানেজমেন্ট সিস্টেম</Text>
              </View>
            </View>

            {/* Login Form Card */}
            <LoginForm />

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                © ২০২৬ DigiKhata. সর্বস্বত্ব সংরক্ষিত।
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: { flex: 1 },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xl,
  },
  topBlobWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 220,
  },
  topBlob: {
    flex: 1,
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    alignItems: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    gap: 14,
  },
  brandTextContainer: {
    alignItems: 'center',
  },
  brandName: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  brandTagline: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
  },
  footer: {
    marginTop: theme.spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: colors.textMuted,
  },
});