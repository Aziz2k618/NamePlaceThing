import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const BG_ITEMS = [
  { label: '🗺️', top: 0.05, left: 0.05 },
  { label: 'N', top: 0.10, left: 0.75 },
  { label: '🦁', top: 0.18, left: 0.40 },
  { label: 'P', top: 0.22, left: 0.88 },
  { label: '🍕', top: 0.32, left: 0.08 },
  { label: 'A', top: 0.38, left: 0.60 },
  { label: '🎬', top: 0.48, left: 0.82 },
  { label: 'T', top: 0.55, left: 0.20 },
  { label: '⚽', top: 0.62, left: 0.70 },
  { label: '🏆', top: 0.70, left: 0.45 },
  { label: '🌍', top: 0.78, left: 0.10 },
  { label: 'N', top: 0.83, left: 0.80 },
  { label: '🎯', top: 0.90, left: 0.35 },
];

function FloatingItem({ label, top, left }: { label: string; top: number; left: number }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const duration = 3000 + Math.random() * 3000;
    const xDist = 8 + Math.random() * 10;
    const yDist = 10 + Math.random() * 14;

    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(translateY, { toValue: -yDist, duration, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: yDist, duration, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(translateX, { toValue: -xDist, duration: duration * 1.2, useNativeDriver: true }),
          Animated.timing(translateX, { toValue: xDist, duration: duration * 1.2, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(rotate, { toValue: 1, duration: duration * 2, useNativeDriver: true }),
          Animated.timing(rotate, { toValue: -1, duration: duration * 2, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  const rotateInterpolate = rotate.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-15deg', '15deg'],
  });

  return (
    <Animated.Text
      style={[styles.bgItem, {
        top: top * height,
        left: left * width,
        transform: [{ translateY }, { translateX }, { rotate: rotateInterpolate }],
      }]}
    >
      {label}
    </Animated.Text>
  );
}

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>

      {/* Floating background items */}
      {BG_ITEMS.map((item, index) => (
        <FloatingItem key={index} {...item} />
      ))}

      {/* Blobs */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />
      <View style={styles.blob3} />

      {/* Title */}
      <View style={styles.titleContainer}>
        <View style={styles.tileRow}>
          <View style={[styles.tile, { backgroundColor: COLORS.primary }]}>
            <Text style={styles.tileLetter}>N</Text>
          </View>
          <View style={[styles.tile, { backgroundColor: COLORS.secondary }]}>
            <Text style={styles.tileLetter}>P</Text>
          </View>
          <View style={[styles.tile, { backgroundColor: COLORS.primary }]}>
            <Text style={styles.tileLetter}>A</Text>
          </View>
          <View style={[styles.tile, { backgroundColor: COLORS.secondary }]}>
            <Text style={styles.tileLetter}>T</Text>
          </View>
        </View>
        <Text style={styles.titleMain}>Name Place</Text>
        <Text style={styles.titleAccent}>Animal Thing!</Text>
        <View style={styles.tag}>
          <Text style={styles.tagText}>🎯 The Ultimate Word Battle Game</Text>
        </View>
      </View>

      {/* Main Buttons */}
      <View style={styles.buttons}>

        <TouchableOpacity
          style={styles.btnPrimary}
          activeOpacity={0.85}
          onPress={() => router.push('/lobby')}
        >
          <Text style={styles.btnIcon}>🌐</Text>
          <View style={styles.btnTextWrap}>
            <Text style={styles.btnText}>Play Online</Text>
            <Text style={styles.btnSub}>2 to 8 players • Real time</Text>
          </View>
          <Text style={styles.btnArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnSecondary}
          activeOpacity={0.85}
          onPress={() => router.push('/bot-difficulty')}
        >
          <Text style={styles.btnIcon}>🤖</Text>
          <View style={styles.btnTextWrap}>
            <Text style={styles.btnText}>Play vs Bot</Text>
            <Text style={styles.btnSub}>Easy • Medium • Hard</Text>
          </View>
          <Text style={styles.btnArrow}>›</Text>
        </TouchableOpacity>

        <View style={styles.bottomRow}>
          <TouchableOpacity
            style={styles.btnSmall}
            activeOpacity={0.85}
            onPress={() => router.push('/leaderboard')}
          >
            <Text style={styles.btnSmallIcon}>🏆</Text>
            <Text style={styles.btnSmallText}>Ranks</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnSmall}
            activeOpacity={0.85}
            onPress={() => router.push('/settings')}
          >
            <Text style={styles.btnSmallIcon}>⚙️</Text>
            <Text style={styles.btnSmallText}>Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnSmall}
            activeOpacity={0.85}
            onPress={() => router.push('/profile')}
          >
            <Text style={styles.btnSmallIcon}>👤</Text>
            <Text style={styles.btnSmallText}>Profile</Text>
          </TouchableOpacity>
        </View>

      </View>

      <Text style={styles.version}>v1.0.0 Beta 🚀</Text>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    overflow: 'hidden',
  },
  blob1: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: COLORS.primary,
    opacity: 0.08,
    top: -120,
    right: -120,
  },
  blob2: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: COLORS.secondary,
    opacity: 0.08,
    bottom: -80,
    left: -80,
  },
  blob3: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.primary,
    opacity: 0.05,
    bottom: 100,
    right: -60,
  },
  bgItem: {
    position: 'absolute',
    fontSize: 28,
    opacity: 0.18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  tileRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.md,
  },
  tile: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  tileLetter: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.white,
  },
  titleMain: {
    fontSize: FONTS.xxl,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  titleAccent: {
    fontSize: FONTS.xxl,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: -0.5,
    textAlign: 'center',
    marginTop: -6,
  },
  tag: {
    backgroundColor: 'rgba(76,175,80,0.15)',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(76,175,80,0.3)',
  },
  tagText: {
    color: COLORS.secondary,
    fontSize: FONTS.small,
    fontWeight: '600',
  },
  buttons: {
    width: '100%',
    gap: 12,
  },
  btnPrimary: {
    backgroundColor: COLORS.primary,
    width: '100%',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  btnSecondary: {
    backgroundColor: '#1e3a24',
    width: '100%',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    elevation: 6,
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
  },
  btnTextWrap: {
    flex: 1,
  },
  btnIcon: {
    fontSize: 30,
  },
  btnText: {
    color: COLORS.white,
    fontSize: FONTS.medium,
    fontWeight: 'bold',
  },
  btnSub: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: FONTS.small,
    marginTop: 2,
  },
  btnArrow: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 30,
    fontWeight: '300',
  },
  bottomRow: {
    flexDirection: 'row',
    gap: 10,
  },
  btnSmall: {
    flex: 1,
    backgroundColor: COLORS.card,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
  },
  btnSmallIcon: {
    fontSize: 22,
  },
  btnSmallText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '500',
  },
  version: {
    position: 'absolute',
    bottom: 20,
    color: COLORS.border,
    fontSize: 11,
  },
});