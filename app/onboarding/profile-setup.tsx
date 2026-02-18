
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_DOB_KEY = 'user_date_of_birth';
const USER_HEIGHT_KEY = 'user_height';

export default function ProfileSetupScreen() {
  const router = useRouter();
  const [dateOfBirth, setDateOfBirth] = useState(new Date(1990, 0, 1));
  const [height, setHeight] = useState('170');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleNext = async () => {
    console.log('User tapped Next on Profile Setup screen');
    console.log('Date of Birth:', dateOfBirth.toISOString());
    console.log('Height:', height, 'cm');

    try {
      await AsyncStorage.setItem(USER_DOB_KEY, dateOfBirth.toISOString());
      await AsyncStorage.setItem(USER_HEIGHT_KEY, height);
      console.log('Profile data saved to AsyncStorage');
      router.push('/onboarding/healthkit-permission');
    } catch (error) {
      console.error('Error saving profile data:', error);
    }
  };

  const handleBack = () => {
    console.log('User tapped Back on Profile Setup screen');
    router.back();
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDateOfBirth(selectedDate);
      console.log('Date of birth changed:', selectedDate.toISOString());
    }
  };

  const formatDate = (date: Date) => {
    const month = date.toLocaleString('default', { month: 'long' });
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  const dateDisplay = formatDate(dateOfBirth);
  const isValid = height.length > 0 && parseInt(height) > 0;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <IconSymbol
                ios_icon_name="chevron.left"
                android_material_icon_name="arrow-back"
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Profile Setup</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>Tell Us About Yourself</Text>
            <Text style={styles.subtitle}>
              This helps us calculate accurate health metrics
            </Text>

            <View style={styles.form}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Date of Birth</Text>
                <TouchableOpacity
                  style={styles.input}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.inputText}>{dateDisplay}</Text>
                  <IconSymbol
                    ios_icon_name="calendar"
                    android_material_icon_name="calendar-today"
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
                <Text style={styles.hint}>
                  Used to calculate age-adjusted baselines
                </Text>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={dateOfBirth}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onDateChange}
                  maximumDate={new Date()}
                  minimumDate={new Date(1900, 0, 1)}
                />
              )}

              <View style={styles.formGroup}>
                <Text style={styles.label}>Height (cm)</Text>
                <TextInput
                  style={styles.textInput}
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="numeric"
                  placeholder="170"
                  placeholderTextColor={colors.textSecondary}
                />
                <Text style={styles.hint}>
                  Used for BMI and biological age calculations
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, !isValid && styles.buttonDisabled]}
            onPress={handleNext}
            activeOpacity={0.8}
            disabled={!isValid}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: Platform.OS === 'android' ? 48 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    color: colors.textSecondary,
    marginBottom: 32,
  },
  form: {
    gap: 24,
  },
  formGroup: {
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputText: {
    fontSize: 17,
    color: colors.text,
  },
  textInput: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 17,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hint: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: colors.background,
  },
  button: {
    backgroundColor: '#0066FF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
