import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { LogoMark } from '../components/LogoMark';
import { LoginForm } from '../components/LoginForm';

export const LoginScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.contentWrapper}>
            {/* Mobile Branding */}
            <View style={styles.brandContainer}>
              <LogoMark size={44} />
              <View style={styles.brandTextContainer}>
                <Text style={styles.brandName}>DigiKhata</Text>
                <Text style={styles.brandTagline}>লজিস্টিকস ম্যানেজমেন্ট সিস্টেম</Text>
              </View>
            </View>

            {/* Login Form Card */}
            <LoginForm />

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>© ২০২৬ DigiKhata. সর্বস্বত্ব সংরক্ষিত।</Text>
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
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    alignItems: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  brandTextContainer: {
    alignItems: 'center',
    marginTop: 14,
  },
  brandName: {
    fontSize: 24,
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
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: colors.textMuted,
  }
});