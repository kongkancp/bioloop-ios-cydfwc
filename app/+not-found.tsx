
import { Link, Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';

export default function NotFoundScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Stack.Screen options={{ title: 'Oops!', headerShown: true }} />
      <View style={styles.content}>
        <IconSymbol
          ios_icon_name="exclamationmark.triangle"
          android_material_icon_name="error"
          size={80}
          color={colors.textSecondary}
        />
        <Text style={styles.title}>Screen Not Found</Text>
        <Text style={styles.message}>
          This screen doesn&apos;t exist in BioLoop.
        </Text>
        <Link href="/(tabs)/(home)/" style={styles.link}>
          <Text style={styles.linkText}>Go to Home</Text>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 24,
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  link: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  linkText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
