import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
  KeyboardTypeOptions,
} from 'react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';

interface AppInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  editable?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  style?: ViewStyle;
}

export const AppInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  keyboardType = 'default',
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  leftIcon,
  rightIcon,
  editable = true,
  autoCapitalize = 'sentences',
  style,
}: AppInputProps) => {
  const [focused, setFocused] = React.useState(false);

  return (
    <View style={[styles.group, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.wrapper,
          focused && styles.wrapperFocused,
          error ? styles.wrapperError : null,
          !editable && styles.wrapperDisabled,
          multiline && styles.wrapperMultiline,
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            leftIcon ? styles.inputWithLeft : null,
            rightIcon ? styles.inputWithRight : null,
          ]}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : undefined}
          editable={editable}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
        />
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  group: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: theme.sizes.inputHeight,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: theme.radius.input,
    backgroundColor: colors.surface,
  },
  wrapperFocused: {
    borderColor: colors.primary,
  },
  wrapperError: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerSoft,
  },
  wrapperDisabled: {
    backgroundColor: colors.background,
  },
  wrapperMultiline: {
    height: undefined,
    paddingVertical: 12,
    alignItems: 'flex-start',
  },
  leftIcon: {
    paddingLeft: 14,
    paddingRight: 8,
  },
  rightIcon: {
    paddingRight: 14,
    paddingLeft: 8,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: colors.textPrimary,
    paddingHorizontal: 14,
  },
  inputWithLeft: {
    paddingLeft: 0,
  },
  inputWithRight: {
    paddingRight: 0,
  },
  inputMultiline: {
    height: undefined,
    textAlignVertical: 'top',
  },
  error: {
    fontSize: 12,
    color: colors.danger,
    fontWeight: '500',
  },
});