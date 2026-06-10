/**
 * RIHLA — Input Field (Uber Clone InputField port)
 * ──────────────────────────────────────────────────
 * Ported from Uber Clone's InputField.tsx.
 * Uses RIHLA's Montserrat fonts, Ionicons, and theme tokens.
 * Supports label, icon, secureTextEntry, and all TextInput props.
 * NOTE: Parent screen should handle KeyboardAvoidingView.
 */

import React from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InputFieldProps {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  secureTextEntry?: boolean;
  labelStyle?: any;
  containerStyle?: any;
  inputStyle?: any;
  iconStyle?: any;
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  placeholderTextColor?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  editable?: boolean;
  multiline?: boolean;
  rightIcon?: React.ReactNode;
}

export default function InputField({
  label,
  icon,
  secureTextEntry = false,
  labelStyle,
  containerStyle,
  inputStyle,
  iconStyle,
  value,
  onChangeText,
  placeholder,
  placeholderTextColor = '#CBD5E1',
  keyboardType = 'default',
  autoCapitalize = 'none',
  editable = true,
  multiline = false,
  rightIcon,
}: InputFieldProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, labelStyle]}>{label}</Text>
      <View style={[styles.inputContainer, containerStyle]}>
        {icon && (
          <Ionicons
            name={icon}
            size={18}
            color="#94A3B8"
            style={[styles.icon, iconStyle]}
          />
        )}
        <TextInput
          style={[styles.input, inputStyle]}
          secureTextEntry={secureTextEntry}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
          multiline={multiline}
        />
        {rightIcon && (
          <View style={styles.rightIconWrap}>{rightIcon}</View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 12,
    fontFamily: 'mon-sb',
    color: '#374151',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 54,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'mon',
    color: '#1F2937',
    paddingVertical: 0,
  },
  rightIconWrap: {
    marginLeft: 8,
  },
});
