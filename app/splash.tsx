import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONTS, SPACING } from '../constants/theme';

export default function SplashScreen() {
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      router.replace('/home');
    }, 3000);

    return () => clearTimeout(timer);

  }, []);

  return (
    <View style={styles.container}>

      <View style={styles.blob1} />
      <View style={styles.blob2} />

      <Animated.View style={[
        styles.logoContainer,
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
      ]}>

        <View style={styles.globeWrap}>
          <Text style={styles.globeEmoji}>🌍</Text>
        </View>

        <Text style={styles.title}>Name Place</Text>
        <Text style={styles.titleAccent}>Animal Thing</Text>
        <Text style={styles.subtitle}>WORD BATTLE GAME</Text>

      </Animated.View>

      <Animated.View style={[styles.loaderWrap, { opacity: fadeAnim }]}>
        <View style={styles.loaderTrack}>
          <View style={styles.loaderBar} />
        </View>
        <Text style={styles.loadingText}>Loading...</Text>
      </Animated.View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
    alignItems: 'center',
    justifyContent: 'center',
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  globeWrap: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: 'rgba(21,101,192,0.3)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,140,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  globeEmoji: {
    fontSize: 52,
  },
  title: {
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
    marginTop: -4,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONTS.small,
    color: 'rgba(255,255,255,0.25)',
    letterSpacing: 3,
    textAlign: 'center',
  },
  loaderWrap: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
    gap: 10,
  },
  loaderTrack: {
    width: 120,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loaderBar: {
    width: '65%',
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  loadingText: {
    fontSize: FONTS.small,
    color: 'rgba(255,255,255,0.2)',
    letterSpacing: 1,
  },
});