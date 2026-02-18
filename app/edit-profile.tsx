
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Modal,
} from 'react-native';
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

export default function EditProfileScreen() {
  const router = useRouter();
  const [dateOfBirth, setDateOfBirth] = useState(new Date(1990, 0, 1));
  const [height, setHeight] = useState('170');
  const [weight, setWeight] = useState('70');
  const [useMetric, setUseMetric] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    console.log('EditProfileScreen: Loading profile data');
    try {
      const dobString = await AsyncStorage.getItem(USER_DOB_KEY);
      const heightString = await AsyncStorage.getItem(USER_HEIGHT_KEY);
      const weightString = await AsyncStorage.getItem(USER_WEIGHT_KEY);
      const useMetricString = await AsyncStorage.getItem(USER_USE_METRIC_KEY);

      if (dobString) {
        setDateOfBirth(new Date(dobString));
      }
      if (heightString) {
        setHeight(heightString);
      }
      if (weightString) {
        setWeight(weightString);
      }
      if (useMetricString) {
        setUseMetric(useMetricString === 'true');
      }

      console.log('EditProfileScreen: Profile data loaded successfully');
    } catch (error) {
      console.error('EditProfileScreen: Error loading profile data', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleSave = async () => {
    console.log('EditProfileScreen: User tapped Save');
    console.log('Date of Birth:', dateOfBirth.toISOString());
    console.log('Height:', height, useMetric ? 'cm' : 'in');
    console.log('Weight:', weight, useMetric ? 'kg' : 'lbs');

    setIsSaving(true);

    try {
      await AsyncStorage.setItem(USER_DOB_KEY, dateOfBirth.toISOString());
      await AsyncStorage.setItem(USER_HEIGHT_KEY, height);
      await AsyncStorage.setItem(USER_WEIGHT_KEY, weight);
      await AsyncStorage.setItem(USER_USE_METRIC_KEY, useMetric ? 'true' : 'false');
      
      console.log('EditProfileScreen: Profile data saved successfully');
      setIsSaving(false);
      setShowSuccessModal(true);

      setTimeout(() => {
        setShowSuccessModal(false);
        router.back();
      }, 1500);
    } catch (error) {
      console.error('EditProfileScreen: Error saving profile data', error);
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    console.log('EditProfileScreen: User tapped Cancel');
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

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const dateDisplay = formatDate(dateOfBirth);
  const heightUnit = useMetric ? 'cm' : 'in';
  const weightUnit = useMetric ? 'kg' : 'lbs';

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity
            onPress={handleSave}
            style={styles.headerButton}
            disabled={!isValid || isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={[styles.saveText, !isValid && styles.saveTextDisabled]}>
                Save
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Info</Text>
            <View style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>DOB</Text>
                <TouchableOpacity
                  style={styles.rowValue}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.rowValueText}>{dateDisplay}</Text>
                  <IconSymbol
                    ios_icon_name="calendar"
                    android_material_icon_name="calendar-today"
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>
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

          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Measurements</Text>
            <View style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Height</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.input}
                    value={height}
                    onChangeText={setHeight}
                    keyboardType="decimal-pad"
                    placeholder="170"
                    placeholderTextColor={colors.textSecondary}
                  />
                  <Text style={styles.unitText}>{heightUnit}</Text>
                </View>
              </View>

              <View style={[styles.row, styles.rowLast]}>
                <Text style={styles.rowLabel}>Weight</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.input}
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="decimal-pad"
                    placeholder="70"
                    placeholderTextColor={colors.textSecondary}
                  />
                  <Text style={styles.unitText}>{weightUnit}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Units</Text>
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
          </View>
        </ScrollView>

        <Modal visible={showSuccessModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.successModal}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check-circle"
                size={48}
                color="#34C759"
              />
              <Text style={styles.successText}>Profile Updated</Text>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerButton: {
    minWidth: 60,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  cancelText: {
    fontSize: 17,
    color: colors.primary,
  },
  saveText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'right',
  },
  saveTextDisabled: {
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 48 : 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowLabel: {
    fontSize: 17,
    color: colors.text,
  },
  rowValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowValueText: {
    fontSize: 17,
    color: colors.text,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    fontSize: 17,
    color: colors.text,
    textAlign: 'right',
    minWidth: 80,
  },
  unitText: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModal: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 16,
  },
  successText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
});
