
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { Stack, useLocalSearchParams } from 'expo-router';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
  },
  iconSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  metricTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  metricDescription: {
    fontSize: 17,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: 32,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 24,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  infoValue: {
    fontSize: 17,
    color: colors.text,
    lineHeight: 24,
  },
  formulaValue: {
    fontSize: 17,
    color: colors.textSecondary,
    lineHeight: 24,
    fontStyle: 'italic',
  },
});

export default function MetricDetailScreen() {
  const params = useLocalSearchParams();

  const metricName = params.name as string;
  const metricIcon = params.icon as string;
  const metricDesc = params.desc as string;
  const metricRange = params.range as string;
  const metricIdeal = params.ideal as string;
  const metricFormula = params.formula as string;

  const screenTitle = metricName || 'Metric Detail';

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: screenTitle,
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.iconSection}>
          <IconSymbol
            ios_icon_name="chart.bar.fill"
            android_material_icon_name={metricIcon || 'info'}
            size={50}
            color={colors.primary}
          />
        </View>

        <Text style={styles.metricTitle}>{metricName}</Text>
        <Text style={styles.metricDescription}>{metricDesc}</Text>

        <View style={styles.divider} />

        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>Range</Text>
          <Text style={styles.infoValue}>{metricRange}</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>Ideal Value</Text>
          <Text style={styles.infoValue}>{metricIdeal}</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>Formula</Text>
          <Text style={styles.formulaValue}>{metricFormula}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
