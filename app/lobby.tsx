import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../constants/theme';

export default function LobbyScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Play</Text>
      <Text style={styles.subtitle}>Choose how you want to jump in</Text>

      <TouchableOpacity
        style={[styles.button, styles.primaryButton]}
        onPress={() => router.push('/create-lobby')}
      >
        <Text style={styles.buttonEmoji}>➕</Text>
        <View style={styles.buttonTextWrap}>
          <Text style={styles.buttonTitle}>Create Lobby</Text>
          <Text style={styles.buttonDesc}>Host a game, invite friends or go public</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/browse-lobbies')}
      >
        <Text style={styles.buttonEmoji}>🌐</Text>
        <View style={styles.buttonTextWrap}>
          <Text style={styles.buttonTitle}>Browse Public Lobbies</Text>
          <Text style={styles.buttonDesc}>Join a random open game</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/join-code')}
      >
        <Text style={styles.buttonEmoji}>🔑</Text>
        <View style={styles.buttonTextWrap}>
          <Text style={styles.buttonTitle}>Join with Code</Text>
          <Text style={styles.buttonDesc}>Play privately with friends</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  title: {
    color: COLORS.white,
    fontSize: FONTS.xxl,
    fontWeight: '900',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: FONTS.body,
    marginBottom: SPACING.xl,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  primaryButton: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(255,140,0,0.08)',
  },
  buttonEmoji: {
    fontSize: 28,
    marginRight: SPACING.md,
  },
  buttonTextWrap: {
    flex: 1,
  },
  buttonTitle: {
    color: COLORS.white,
    fontSize: FONTS.medium,
    fontWeight: '700',
  },
  buttonDesc: {
    color: COLORS.textMuted,
    fontSize: FONTS.small,
    marginTop: 2,
  },
});