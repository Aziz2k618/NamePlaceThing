import { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
  { label: '🎨', top: 0.90, left: 0.55 }
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
          Animated.timing(translateY, { toValue: -yDist, duration, useNativeDriver: true, }),
          Animated.timing(translateY, { toValue: yDist, duration, useNativeDriver: true, }),
        ]),
        Animated.sequence([
          Animated.timing(translateX, { toValue: -xDist, duration: duration * 1.2, useNativeDriver: true, }),
          Animated.timing(translateX, { toValue: xDist, duration: duration * 1.2, useNativeDriver: true, }),
        ]),
        Animated.sequence([
          Animated.timing(rotate, { toValue: 1, duration: duration * 2, useNativeDriver: true, }),
          Animated.timing(rotate, { toValue: -1, duration: duration * 2, useNativeDriver: true, }),
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
        transform: [
          { translateY },
          { translateX },
          { rotate: rotateInterpolate },
        ],
      }]}
    >
      {label}
    </Animated.Text>
  );
}

export default function HomeScreen() {
  return (
    <View style={styles.container}>

      {/* Floating background items */}
      {BG_ITEMS.map((item, index) => (
        <FloatingItem key={index} {...item} />
      ))}

      {/* Glow blobs */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />
      <View style={styles.blob3} />

      {/* Title */}
      <View style={styles.titleContainer}>
        <View style={styles.tileRow}>
          <View style={[styles.tile, { backgroundColor: '#FF8C00' }]}>
            <Text style={styles.tileLetter}>N</Text>
          </View>
          <View style={[styles.tile, { backgroundColor: '#4CAF50' }]}>
            <Text style={styles.tileLetter}>P</Text>
          </View>
          <View style={[styles.tile, { backgroundColor: '#FF8C00' }]}>
            <Text style={styles.tileLetter}>A</Text>
          </View>
          <View style={[styles.tile, { backgroundColor: '#4CAF50' }]}>
            <Text style={styles.tileLetter}>T</Text>
          </View>
        </View>
        <Text style={styles.titleMain}>Name Place</Text>
        <Text style={styles.titleMain2}>Animal Thing!</Text>
        <View style={styles.tagContainer}>
          <Text style={styles.tagText}>🎯 The Ultimate Word Battle Game</Text>
        </View>
      </View>

      {/* Main Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.buttonPrimary} activeOpacity={0.85}>
          <Text style={styles.buttonIcon}>🌐</Text>
          <View style={styles.buttonTextContainer}>
            <Text style={styles.buttonText}>Play Online</Text>
            <Text style={styles.buttonSubText}>2 to 8 players • Real time</Text>
          </View>
          <Text style={styles.buttonArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonSecondary} activeOpacity={0.85}>
          <Text style={styles.buttonIcon}>🤖</Text>
          <View style={styles.buttonTextContainer}>
            <Text style={styles.buttonText}>Play vs Bot</Text>
            <Text style={styles.buttonSubText}>Easy • Medium • Hard</Text>
          </View>
          <Text style={styles.buttonArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} activeOpacity={0.8}>
          <Text style={styles.tabIcon}>🏠</Text>
          <Text style={[styles.tabLabel, { color: '#FF8C00' }]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} activeOpacity={0.8}>
          <Text style={styles.tabIcon}>🏆</Text>
          <Text style={styles.tabLabel}>Ranks</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabPlayButton} activeOpacity={0.85}>
          <Text style={styles.tabPlayIcon}>⚡</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} activeOpacity={0.8}>
          <Text style={styles.tabIcon}>⚙️</Text>
          <Text style={styles.tabLabel}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} activeOpacity={0.8}>
          <Text style={styles.tabIcon}>👤</Text>
          <Text style={styles.tabLabel}>Profile</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a2235',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  blob1: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: '#FF8C00',
    opacity: 0.12,
    top: -120,
    right: -120,
  },
  blob2: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#4CAF50',
    opacity: 0.1,
    bottom: -80,
    left: -80,
  },
  blob3: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#FF8C00',
    opacity: 0.07,
    bottom: 100,
    right: -60,
  },
  bgItem: {
    position: 'absolute',
    fontSize: 28,
    opacity: 0.2,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 36,
    paddingHorizontal: 24,
  },
  tileRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  tile: {
    width: 52,
    height: 52,
    borderRadius: 12,
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
    color: '#fff',
  },
  titleMain: {
    fontSize: 44,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  titleMain2: {
    fontSize: 44,
    fontWeight: '900',
    color: '#FF8C00',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginTop: -6,
  },
  tagContainer: {
    backgroundColor: 'rgba(76,175,80,0.15)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(76,175,80,0.3)',
  },
  tagText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 24,
  },
  buttonPrimary: {
    backgroundColor: '#FF8C00',
    width: '100%',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    elevation: 8,
    shadowColor: '#FF8C00',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  buttonSecondary: {
    backgroundColor: '#1e3a24',
    width: '100%',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    elevation: 6,
    borderWidth: 1.5,
    borderColor: '#4CAF50',
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonIcon: {
    fontSize: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  buttonSubText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    marginTop: 2,
  },
  buttonArrow: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 30,
    fontWeight: '300',
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#111827',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
    elevation: 20,
  },
  tabItem: {
    alignItems: 'center',
    gap: 3,
    flex: 1,
  },
  tabIcon: {
    fontSize: 22,
  },
  tabLabel: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '500',
  },
  tabPlayButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF8C00',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 10,
    shadowColor: '#FF8C00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  tabPlayIcon: {
    fontSize: 26,
  },
});