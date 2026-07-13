import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../constants/theme';

export default function ResultsScreen() {
  const router = useRouter();
  const { playerScore, botScore, rounds, difficulty } = useLocalSearchParams<{
    playerScore: string;
    botScore: string;
    rounds: string;
    difficulty: string;
  }>();

  const totalPlayer = Number(playerScore) || 0;
  const totalBot = Number(botScore) || 0;
  const roundsData = rounds ? JSON.parse(rounds) : [];
  const playerWon = totalPlayer > totalBot;
  const isDraw = totalPlayer === totalBot;

  return (
    <View style={styles.container}>
      <View style={styles.blob1} />
      <View style={styles.blob2} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* Result Banner */}
        <View style={[styles.banner, {
          backgroundColor: isDraw
            ? 'rgba(255,215,0,0.1)'
            : playerWon
              ? 'rgba(76,175,80,0.1)'
              : 'rgba(255,101,132,0.1)',
          borderColor: isDraw
            ? 'rgba(255,215,0,0.3)'
            : playerWon
              ? 'rgba(76,175,80,0.3)'
              : 'rgba(255,101,132,0.3)',
        }]}>
          <Text style={styles.bannerEmoji}>
            {isDraw ? '🤝' : playerWon ? '🏆' : '😔'}
          </Text>
          <Text style={[styles.bannerTitle, {
            color: isDraw
              ? COLORS.warning
              : playerWon
                ? COLORS.secondary
                : COLORS.danger
          }]}>
            {isDraw ? 'It\'s a Draw!' : playerWon ? 'You Won!' : 'Bot Won!'}
          </Text>
          <Text style={styles.bannerSub}>
            {isDraw
              ? 'Great game — evenly matched!'
              : playerWon
                ? 'Amazing performance!'
                : 'Better luck next time!'}
          </Text>
        </View>

        {/* Score Comparison */}
        <View style={styles.scoreRow}>
          <View style={[styles.scoreBox, playerWon && styles.scoreBoxWinner]}>
            <Text style={styles.scoreLabel}>YOU</Text>
            <Text style={styles.scoreNumber}>{totalPlayer}</Text>
            <Text style={styles.scorePts}>points</Text>
          </View>
          <View style={styles.scoreDivider}>
            <Text style={styles.vsText}>VS</Text>
          </View>
          <View style={[styles.scoreBox, !playerWon && !isDraw && styles.scoreBoxWinner]}>
            <Text style={styles.scoreLabel}>BOT</Text>
            <Text style={styles.scoreNumber}>{totalBot}</Text>
            <Text style={styles.scorePts}>points</Text>
          </View>
        </View>

        {/* Round Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Round Breakdown</Text>
          {roundsData.map((round: { player: number; bot: number }, index: number) => (
            <View key={index} style={styles.roundRow}>
              <Text style={styles.roundLabel}>Round {index + 1}</Text>
              <View style={styles.roundScores}>
                <Text style={[
                  styles.roundScore,
                  { color: round.player >= round.bot ? COLORS.secondary : COLORS.textMuted }
                ]}>
                  {round.player} pts
                </Text>
                <Text style={styles.roundVs}>—</Text>
                <Text style={[
                  styles.roundScore,
                  { color: round.bot > round.player ? COLORS.danger : COLORS.textMuted }
                ]}>
                  {round.bot} pts
                </Text>
              </View>
              <Text style={styles.roundWinner}>
                {round.player > round.bot ? '✅ You' : round.bot > round.player ? '🤖 Bot' : '🤝 Draw'}
              </Text>
            </View>
          ))}
        </View>

        {/* Difficulty Badge */}
        <View style={styles.diffBadge}>
          <Text style={styles.diffText}>
            Difficulty: {(difficulty as string)?.toUpperCase() || 'MEDIUM'}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => router.replace('/bot-difficulty')}
            activeOpacity={0.85}
          >
            <Text style={styles.btnText}>▶ Play Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={() => router.replace('/home')}
            activeOpacity={0.85}
          >
            <Text style={styles.btnSecondaryText}>🏠 Home</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
    overflow: 'hidden',
  },
  blob1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: COLORS.primary,
    opacity: 0.07,
    top: -100,
    right: -100,
  },
  blob2: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: COLORS.secondary,
    opacity: 0.06,
    bottom: -80,
    left: -80,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingTop: SPACING.xxl + SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  banner: {
    width: '100%',
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  bannerEmoji: {
    fontSize: 52,
    marginBottom: SPACING.sm,
  },
  bannerTitle: {
    fontSize: FONTS.xl,
    fontWeight: '900',
    marginBottom: 4,
  },
  bannerSub: {
    fontSize: FONTS.body,
    color: COLORS.textMuted,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  scoreBox: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  scoreBoxWinner: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(255,140,0,0.08)',
  },
  scoreLabel: {
    fontSize: FONTS.small,
    color: COLORS.textMuted,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 4,
  },
  scoreNumber: {
    fontSize: FONTS.title,
    fontWeight: '900',
    color: COLORS.white,
  },
  scorePts: {
    fontSize: FONTS.small,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  scoreDivider: {
    alignItems: 'center',
  },
  vsText: {
    fontSize: FONTS.body,
    color: COLORS.border,
    fontWeight: '700',
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.body,
    color: COLORS.textMuted,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
  roundRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  roundLabel: {
    fontSize: FONTS.small,
    color: COLORS.textMuted,
    fontWeight: '600',
    width: 60,
  },
  roundScores: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  roundScore: {
    fontSize: FONTS.small,
    fontWeight: '700',
  },
  roundVs: {
    fontSize: FONTS.small,
    color: COLORS.border,
  },
  roundWinner: {
    fontSize: FONTS.small,
    color: COLORS.textMuted,
  },
  diffBadge: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  diffText: {
    fontSize: FONTS.small,
    color: COLORS.textMuted,
    fontWeight: '600',
    letterSpacing: 1,
  },
  buttons: {
    gap: 12,
  },
  btnPrimary: {
    width: '100%',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    elevation: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  btnText: {
    fontSize: FONTS.medium,
    fontWeight: '900',
    color: COLORS.white,
  },
  btnSecondary: {
    width: '100%',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  btnSecondaryText: {
    fontSize: FONTS.medium,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
});