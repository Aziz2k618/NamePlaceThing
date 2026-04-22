import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../constants/theme';

const DIFFICULTIES = [
  {
    level: 'easy',
    label: 'Easy',
    emoji: '🟢',
    desc: 'Bot plays slow and makes mistakes',
    color: '#4CAF50',
    bg: 'rgba(76,175,80,0.1)',
    border: 'rgba(76,175,80,0.3)',
  },
  {
    level: 'medium',
    label: 'Medium',
    emoji: '🟡',
    desc: 'Bot is decent — good for practice',
    color: '#FFD700',
    bg: 'rgba(255,215,0,0.1)',
    border: 'rgba(255,215,0,0.3)',
  },
  {
    level: 'hard',
    label: 'Hard',
    emoji: '🔴',
    desc: 'Bot is fast and fills all answers',
    color: '#FF6584',
    bg: 'rgba(255,101,132,0.1)',
    border: 'rgba(255,101,132,0.3)',
  },
];

export default function BotDifficultyScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>

      {/* Background blobs */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => router.back()}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>🎮</Text>
        <Text style={styles.headerTitle}>Choose Difficulty</Text>
        <Text style={styles.headerSub}>
          Choose the game difficulty mode
        </Text>
      </View>

      {/* Difficulty Cards */}
      <View style={styles.cardsContainer}>
        {DIFFICULTIES.map((item) => (
          <TouchableOpacity
            key={item.level}
            style={[styles.card, {
              backgroundColor: item.bg,
              borderColor: item.border,
            }]}
            activeOpacity={0.8}
            onPress={() => router.push(`/game?difficulty=${item.level}&mode=bot`)}
          >
            <Text style={styles.cardEmoji}>{item.emoji}</Text>
            <View style={styles.cardText}>
              <Text style={[styles.cardLabel, { color: item.color }]}>
                {item.label}
              </Text>
              <Text style={styles.cardDesc}>{item.desc}</Text>
            </View>
            <Text style={[styles.cardArrow, { color: item.color }]}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
    padding: SPACING.lg,
    overflow: 'hidden',
  },
  blob1: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: COLORS.secondary,
    opacity: 0.06,
    top: -100,
    right: -100,
  },
  blob2: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: COLORS.primary,
    opacity: 0.06,
    bottom: -60,
    left: -60,
  },
  backBtn: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
    alignSelf: 'flex-start',
    padding: SPACING.sm,
  },
  backText: {
    color: COLORS.textMuted,
    fontSize: FONTS.body,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  headerEmoji: {
    fontSize: 56,
    marginBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: FONTS.xl,
    fontWeight: '900',
    color: COLORS.white,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  headerSub: {
    fontSize: FONTS.body,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  cardsContainer: {
    gap: 14,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    gap: 16,
  },
  cardEmoji: {
    fontSize: 32,
  },
  cardText: {
    flex: 1,
  },
  cardLabel: {
    fontSize: FONTS.large,
    fontWeight: '800',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: FONTS.small,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  cardArrow: {
    fontSize: 28,
    fontWeight: '300',
  },
});