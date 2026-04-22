import { Stack } from 'expo-router';


export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="splash" options={{ gestureEnabled: false }} />
      <Stack.Screen name="home" />
      <Stack.Screen name="lobby" />
      <Stack.Screen name="waiting-room" />
      <Stack.Screen name="game" />
      <Stack.Screen name="voting" />
      <Stack.Screen name="results" />
      <Stack.Screen name="bot-difficulty" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="leaderboard" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="match-history" />
    </Stack>
  );
}