
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '@/constants/Colors';

interface BioCardProps {
  children: React.ReactNode;
  accentColor?: string;
  style?: ViewStyle;
}

export function BioCard({ children, accentColor, style }: BioCardProps) {
  return (
    <View
      style={[
        styles.card,
        accentColor && { borderLeftWidth: 3, borderLeftColor: accentColor },
        style
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  }
});
