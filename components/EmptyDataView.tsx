
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { Colors } from '@/constants/Colors';

interface EmptyDataViewProps {
  icon: string;
  iosIcon: string;
  title: string;
  message: string;
  actionTitle: string;
  action: () => void;
}

export default function EmptyDataView({
  icon,
  iosIcon,
  title,
  message,
  actionTitle,
  action,
}: EmptyDataViewProps) {
  return (
    <View style={styles.container}>
      <IconSymbol
        ios_icon_name={iosIcon}
        android_material_icon_name={icon}
        size={60}
        color={Colors.textMuted}
      />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={action} activeOpacity={0.8}>
        <Text style={styles.buttonText}>{actionTitle}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 24,
  },
  textContainer: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  message: {
    fontSize: 17,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    backgroundColor: Colors.accentBlue,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
