
import { Stack } from 'expo-router';

export default function HomeLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false, // ✅ CORRECT: No header, no back button for Home tab
        }}
      />
    </Stack>
  );
}
