import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Keyboard, ActivityIndicator, Alert } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/stores/authStore';
import { tokenStorage } from '@/storage/tokenStorage';

function GoogleLogo() {
  return (
    <Svg width="20" height="20" viewBox="0 0 24 24">
      <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z" fill="#4285F4" />
      <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" fill="#34A853" />
      <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84Z" fill="#FBBC05" />
      <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z" fill="#EA4335" />
    </Svg>
  );
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const LoginForm = () => {
  const router = useRouter();
  const { setUser } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const validate = (): boolean => {
    Keyboard.dismiss();
    const next: { email?: string; password?: string } = {};
    let valid = true;

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      next.email = 'ইমেইল প্রদান করুন';
      valid = false;
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      next.email = 'সঠিক ইমেইল এড্রেস লিখুন (যেমন: user@example.com)';
      valid = false;
    }

    if (!password) {
      next.password = 'পাসওয়ার্ড প্রদান করুন';
      valid = false;
    }

    setErrors(next);
    return valid;
  };

  const handleLogin = async () => {
    if (loading) return;
    if (!validate()) return;
    
    const trimmedEmail = email.trim();
    setLoading(true);

    try {
      console.log('[Auth] Initiating login for:', trimmedEmail);

      // 1. Authenticate with exact backend schema
      const res = await authApi.login({
        email: trimmedEmail,
        password: password,
        clientType: 'MOBILE',
      });

      console.log('[Auth] Login response received. Storing tokens...');

      // 2. Store tokens securely
      await tokenStorage.setAccessToken(res.data.accessToken);
      if (res.data.refreshToken) {
        await tokenStorage.setRefreshToken(res.data.refreshToken);
      }

      // 3. Fetch current user profile
      const profile = await authApi.me();
      console.log('[Auth] Profile retrieved successfully. Redirecting...');
      setUser(profile.data);

      router.replace('/(tabs)/dashboard');
    } catch (e: any) {
      console.log('[Auth] Login request failed:', {
        status: e.response?.status,
        code: e.response?.data?.error?.code,
        message: e.response?.data?.error?.message || e.message,
      });

      const errorMessage =
        e.response?.data?.error?.message ||
        e.response?.data?.message ||
        (e.message === 'Network Error'
          ? 'নেটওয়ার্ক ত্রুটি: সার্ভারের সাথে সংযোগ স্থাপন করা সম্ভব হচ্ছে না।'
          : 'সঠিক ইমেইল এবং পাসওয়ার্ড প্রদান করুন।');
      
      Alert.alert('লগইন ব্যর্থ', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    Alert.alert('গুগল লগইন', 'গুগল লগইন এর জন্য ব্যাকএন্ড অথেন্টিকেশন প্রয়োজন, যা পরবর্তীতে সংযুক্ত করা হবে।');
  };

  return (
    <View style={styles.card}>
      {/* Heading */}
      <View style={styles.headingContainer}>
        <Text style={styles.title}>আপনাকে স্বাগতম</Text>
        <Text style={styles.subtitle}>
          আপনার ব্যবসায়িক ড্যাশবোর্ডে প্রবেশ করতে লগইন করুন।
        </Text>
      </View>

      {/* Google Button */}
      <TouchableOpacity 
        style={styles.googleBtn}
        activeOpacity={0.7}
        onPress={handleGoogleLogin}
      >
        <GoogleLogo />
        <Text style={styles.googleBtnText}>গুগল দিয়ে চালিয়ে যান</Text>
      </TouchableOpacity>

      {/* Divider */}
      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>অথবা</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Form */}
      <View style={styles.formContainer}>
        {/* Email Field */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>ইমেইল</Text>
          <View style={[
            styles.inputWrapper, 
            isEmailFocused && styles.inputWrapperFocused,
            errors.email ? styles.inputWrapperError : null
          ]}>
            <Feather 
              name="mail" 
              size={18} 
              color={isEmailFocused ? colors.primary : colors.textMuted} 
              style={styles.inputIcon} 
            />
            <TextInput
              style={styles.input}
              placeholder="যেমন: user@example.com"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
              }}
              onFocus={() => setIsEmailFocused(true)}
              onBlur={() => setIsEmailFocused(false)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
            />
          </View>
          {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
        </View>

        {/* Password Field */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>পাসওয়ার্ড</Text>
          <View style={[
            styles.inputWrapper, 
            isPasswordFocused && styles.inputWrapperFocused,
            errors.password ? styles.inputWrapperError : null
          ]}>
            <Feather 
              name="lock" 
              size={18} 
              color={isPasswordFocused ? colors.primary : colors.textMuted} 
              style={styles.inputIcon} 
            />
            <TextInput
              style={[styles.input, { paddingRight: 45 }]}
              placeholder="আপনার পাসওয়ার্ড লিখুন"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
              }}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="password"
              textContentType="password"
            />
            <TouchableOpacity 
              style={styles.eyeBtn} 
              onPress={() => setShowPassword(!showPassword)}
            >
              <Feather name={showPassword ? "eye-off" : "eye"} size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
          {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
        </View>

        {/* Remember & Forgot Password */}
        <View style={styles.optionsRow}>
          <TouchableOpacity 
            style={styles.checkboxContainer} 
            activeOpacity={0.7}
            onPress={() => setRemember(!remember)}
          >
            <View style={[styles.checkbox, remember && styles.checkboxChecked]}>
              {remember && <Feather name="check" size={12} color={colors.surface} />}
            </View>
            <Text style={styles.checkboxLabel}>আমাকে মনে রাখুন</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => Alert.alert('পাসওয়ার্ড পুনরুদ্ধার', 'পাসওয়ার্ড পরিবর্তনের জন্য অনুগ্রহ করে অ্যাডমিন বা সহায়তায় যোগাযোগ করুন।')}
          >
            <Text style={styles.forgotBtn}>পাসওয়ার্ড ভুলে গেছেন?</Text>
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={handleLogin}
          disabled={loading}
          style={[styles.submitBtnContainer, loading && { opacity: 0.7 }]}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.submitBtn}
          >
            {loading ? (
              <ActivityIndicator color={colors.surface} size="small" />
            ) : (
              <Text style={styles.submitBtnText}>লগইন করুন</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Security Note */}
      <View style={styles.secureNote}>
        <MaterialCommunityIcons name="shield-check-outline" size={16} color={colors.success} />
        <Text style={styles.secureNoteText}>আপনার তথ্য নিরাপদ ও এনক্রিপ্টেড</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 20,
    paddingVertical: 28,
    width: '100%',
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  headingContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: theme.sizes.buttonHeight,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: theme.radius.button,
    marginBottom: 20,
  },
  googleBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: 12,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 13,
    color: colors.textMuted,
  },
  formContainer: {
    gap: 18,
  },
  inputGroup: {
    gap: 7,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: theme.sizes.inputHeight,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: theme.radius.input,
    backgroundColor: colors.surface,
  },
  inputWrapperFocused: {
    borderColor: colors.primary,
  },
  inputWrapperError: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerLight,
  },
  inputIcon: {
    paddingLeft: 16,
    paddingRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: colors.textPrimary,
    paddingRight: 16,
  },
  eyeBtn: {
    position: 'absolute',
    right: 0,
    height: '100%',
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 13,
    color: colors.danger,
    fontWeight: '500',
    marginTop: 2,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  forgotBtn: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  submitBtnContainer: {
    marginTop: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  submitBtn: {
    height: theme.sizes.buttonHeight,
    borderRadius: theme.radius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  secureNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 6,
  },
  secureNoteText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.success,
  }
});
