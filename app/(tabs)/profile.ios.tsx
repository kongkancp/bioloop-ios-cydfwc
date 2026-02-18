
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';

interface ProfileItem {
  label: string;
  value: string;
  icon: string;
  iosIcon: string;
}

export default function ProfileScreen() {
  const [profileData, setProfileData] = useState<ProfileItem[]>([
    {
      label: 'Date of Birth',
      value: 'January 15, 1992',
      icon: 'cake',
      iosIcon: 'birthday.cake.fill',
    },
    {
      label: 'Height',
      value: '175 cm',
      icon: 'height',
      iosIcon: 'ruler.fill',
    },
    {
      label: 'Weight',
      value: '72 kg',
      icon: 'monitor-weight',
      iosIcon: 'scalemass.fill',
    },
    {
      label: 'Gender',
      value: 'Male',
      icon: 'person',
      iosIcon: 'person.fill',
    },
  ]);

  const handleEditProfile = () => {
    console.log('User tapped Edit Profile button');
    // TODO: Backend Integration - Navigate to profile edit screen
    // Would allow updating user profile data
  };

  const handleHealthKitPermissions = () => {
    console.log('User tapped HealthKit Permissions button');
    // TODO: Backend Integration - POST /api/health/permissions to request HealthKit permissions
    // This would trigger iOS HealthKit authorization dialog
  };

  const handleExportData = () => {
    console.log('User tapped Export Data button');
    // TODO: Backend Integration - GET /api/health/export to download all health data
    // Expected response: CSV or JSON file with all user health metrics
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* Profile Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <IconSymbol
              ios_icon_name="person.circle.fill"
              android_material_icon_name="person"
              size={28}
              color={colors.primary}
            />
            <Text style={styles.cardTitle}>Personal Information</Text>
          </View>
          
          {profileData.map((item, index) => (
            <React.Fragment key={index}>
              <View style={styles.profileItem}>
                <View style={styles.profileItemLeft}>
                  <IconSymbol
                    ios_icon_name={item.iosIcon}
                    android_material_icon_name={item.icon}
                    size={20}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.profileLabel}>{item.label}</Text>
                </View>
                <Text style={styles.profileValue}>{item.value}</Text>
              </View>
            </React.Fragment>
          ))}

          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <IconSymbol
              ios_icon_name="pencil"
              android_material_icon_name="edit"
              size={18}
              color={colors.primary}
            />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Settings Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <IconSymbol
              ios_icon_name="gearshape.fill"
              android_material_icon_name="settings"
              size={28}
              color={colors.primary}
            />
            <Text style={styles.cardTitle}>Settings</Text>
          </View>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleHealthKitPermissions}
          >
            <View style={styles.settingItemLeft}>
              <IconSymbol
                ios_icon_name="heart.text.square.fill"
                android_material_icon_name="health-and-safety"
                size={20}
                color={colors.textSecondary}
              />
              <Text style={styles.settingLabel}>HealthKit Permissions</Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleExportData}
          >
            <View style={styles.settingItemLeft}>
              <IconSymbol
                ios_icon_name="arrow.down.circle.fill"
                android_material_icon_name="download"
                size={20}
                color={colors.textSecondary}
              />
              <Text style={styles.settingLabel}>Export Health Data</Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* About Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <IconSymbol
              ios_icon_name="info.circle.fill"
              android_material_icon_name="info"
              size={28}
              color={colors.primary}
            />
            <Text style={styles.cardTitle}>About BioLoop</Text>
          </View>
          <Text style={styles.aboutText}>
            BioLoop is a health analytics platform that uses your HealthKit data to calculate your Performance Index and biological age.
          </Text>
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </View>
        </View>

        {/* Privacy Notice */}
        <View style={[styles.card, styles.privacyCard]}>
          <IconSymbol
            ios_icon_name="lock.fill"
            android_material_icon_name="lock"
            size={20}
            color={colors.success}
          />
          <Text style={styles.privacyText}>
            Your health data is encrypted and stored locally on your device. We never share your data with third parties.
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  header: {
    marginTop: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.text,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 12,
  },
  profileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  profileItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileLabel: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.textSecondary,
    marginLeft: 12,
  },
  profileValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: colors.highlight,
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.text,
    marginLeft: 12,
  },
  aboutText: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  versionContainer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  versionText: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  privacyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.highlight,
  },
  privacyText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '400',
    color: colors.text,
    lineHeight: 18,
    marginLeft: 12,
  },
  bottomSpacer: {
    height: 20,
  },
});
