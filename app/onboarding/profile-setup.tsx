
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_DOB_KEY = 'user_date_of_birth';
const USER_HEIGHT_KEY = 'user_height';
const USER_WEIGHT_KEY = 'user_weight';
const USER_USE_METRIC_KEY = 'user_use_metric';

export default function ProfileSetupScreen() {
  const router = useRouter();
  const [dateOfBirth, setDateOfBirth] = useState(new Date(1990, 0, 1));
  const [height, setHeight] = useState('170');
  const [weight, setWeight] = useState('70');
  const [useMetric, setUseMetric] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const age = useMemo(() => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }
    return calculatedAge;
  }, [dateOfBirth]);

  const isValid = useMemo(() => {
    const parsedHeight = parseFloat(height);
    const parsedWeight = parseFloat(weight);
    return age >= 18 && age <= 100 && parsedHeight > 0 && parsedWeight > 0;
  }, [age, height, weight]);

  const handleNext = async () => {
    console.log('User tapped Continue on Profile Setup screen');
    console.log('Date of Birth:', dateOfBirth.toISOString());
    console.log('Height:', height, useMetric ? 'cm' : 'in');
    console.log('Weight:', weight, useMetric ? 'kg' : 'lbs');
    console.log('Use Metric:', useMetric);

    try {
      await AsyncStorage.setItem(USER_DOB_KEY, dateOfBirth.toISOString());
      await AsyncStorage.setItem(USER_HEIGHT_KEY, height);
      await AsyncStorage.setItem(USER_WEIGHT_KEY, weight);
      await AsyncStorage.setItem(USER_USE_METRIC_KEY, useMetric ? 'true' : 'false');
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
  const ageDisplay = `Age: ${age}`;
  const heightUnit = useMetric ? 'cm' : 'in';
  const weightUnit = useMetric ? 'kg' : 'lbs';

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
              This helps calculate BioAge
            </Text>

            <View style={styles.form}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Date of Birth</Text>
                <TouchableOpacity
                  style={styles.input}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.inputText}>{dateDisplay}</Text>
                  <View style={styles.inputRight}>
                    <Text style={styles.ageText}>{ageDisplay}</Text>
                    <IconSymbol
                      ios_icon_name="calendar"
                      android_material_icon_name="calendar-today"
                      size={20}
                      color="#0066FF"
                    />
                  </View>
                </TouchableOpacity>
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

              <View style={styles.segmentedControl}>
                <TouchableOpacity
                  style={[
                    styles.segmentButton,
                    styles.segmentButtonLeft,
                    useMetric && styles.segmentButtonActive,
                  ]}
                  onPress={() => {
                    setUseMetric(true);
                    console.log('Switched to Metric units');
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.segmentText, useMetric && styles.segmentTextActive]}>
                    Metric
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.segmentButton,
                    styles.segmentButtonRight,
                    !useMetric && styles.segmentButtonActive,
                  ]}
                  onPress={() => {
                    setUseMetric(false);
                    console.log('Switched to Imperial units');
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.segmentText, !useMetric && styles.segmentTextActive]}>
                    Imperial
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Height</Text>
                <View style={styles.textInputContainer}>
                  <TextInput
                    style={styles.textInput}
                    value={height}
                    onChangeText={setHeight}
                    keyboardType="decimal-pad"
                    placeholder={useMetric ? '170' : '67'}
                    placeholderTextColor={colors.textSecondary}
                  />
                  <Text style={styles.unitText}>{heightUnit}</Text>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Weight</Text>
                <View style={styles.textInputContainer}>
                  <TextInput
                    style={styles.textInput}
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="decimal-pad"
                    placeholder={useMetric ? '70' : '154'}
                    placeholderTextColor={colors.textSecondary}
                  />
                  <Text style={styles.unitText}>{weightUnit}</Text>
                </View>
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
    paddingHorizontal: 32,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
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
    fontSize: 17,
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
  },
  inputText: {
    fontSize: 17,
    color: colors.text,
  },
  inputRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ageText: {
    fontSize: 17,
    color: colors.textSecondary,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 2,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  segmentButtonLeft: {
    marginRight: 1,
  },
  segmentButtonRight: {
    marginLeft: 1,
  },
  segmentButtonActive: {
    backgroundColor: '#0066FF',
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  textInput: {
    flex: 1,
    fontSize: 17,
    color: colors.text,
  },
  unitText: {
    fontSize: 17,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  footer: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    backgroundColor: colors.background,
    paddingBottom: 40,
  },
  button: {
    backgroundColor: '#0066FF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
  },
  buttonDisabled: {
    backgroundColor: colors.textSecondary,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
