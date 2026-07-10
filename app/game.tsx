import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView, Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../constants/theme';

const LETTERS = 'ABCDEFGHIJKLMNOPRSTUVWY'.split('');

const DEFAULT_CATEGORIES = ['Name', 'Place', 'Animal', 'Thing'];

const DEFAULT_ROUNDS = 4;

const TIMER_PER_CATEGORY: Record<string, number> = {
  easy: 15,
  medium: 10,
  hard: 7,
};

type Phase = 'countdown' | 'playing' | 'stopped' | 'roundover' | 'between';

function getBotAnswer(category: string, letter: string, difficulty: string): string {
  const answers: Record<string, Record<string, string[]>> = {
    Name: { A: ['Alice', 'Adam'], B: ['Bob', 'Brian'], C: ['Carlos', 'Chris'], D: ['David', 'Diana'], E: ['Emma', 'Ethan'], F: ['Fiona', 'Frank'], G: ['Grace', 'George'], H: ['Hannah', 'Harry'], I: ['Ivan', 'Iris'], J: ['James', 'Julia'], K: ['Kevin', 'Karen'], L: ['Liam', 'Laura'], M: ['Mike', 'Maria'], N: ['Noah', 'Nina'], O: ['Oliver', 'Olivia'], P: ['Paul', 'Patricia'], R: ['Ryan', 'Rachel'], S: ['Sam', 'Sofia'], T: ['Tom', 'Tina'], U: ['Uma', 'Ulric'], V: ['Victor', 'Victoria'], W: ['William', 'Wendy'], Y: ['Yusuf', 'Yasmin'] },
    Place: { A: ['Australia', 'Austria'], B: ['Brazil', 'Berlin'], C: ['Canada', 'Cairo'], D: ['Denmark', 'Dubai'], E: ['Egypt', 'Ecuador'], F: ['France', 'Finland'], G: ['Germany', 'Greece'], H: ['Hungary', 'Hawaii'], I: ['India', 'Italy'], J: ['Japan', 'Jordan'], K: ['Kenya', 'Kuwait'], L: ['London', 'Lisbon'], M: ['Mexico', 'Morocco'], N: ['Nigeria', 'Norway'], O: ['Oman', 'Oslo'], P: ['Pakistan', 'Paris'], R: ['Russia', 'Rome'], S: ['Spain', 'Seoul'], T: ['Turkey', 'Tokyo'], U: ['Uganda', 'Ukraine'], V: ['Vietnam', 'Venice'], W: ['Wales', 'Warsaw'], Y: ['Yemen', 'Yerevan'] },
    Animal: { A: ['Alligator', 'Ant'], B: ['Bear', 'Buffalo'], C: ['Cat', 'Crocodile'], D: ['Dog', 'Dolphin'], E: ['Elephant', 'Eagle'], F: ['Fox', 'Frog'], G: ['Giraffe', 'Goat'], H: ['Horse', 'Hippo'], I: ['Iguana', 'Ibis'], J: ['Jaguar', 'Jellyfish'], K: ['Kangaroo', 'Koala'], L: ['Lion', 'Leopard'], M: ['Monkey', 'Moose'], N: ['Nightingale', 'Narwhal'], O: ['Ostrich', 'Octopus'], P: ['Parrot', 'Panda'], R: ['Rabbit', 'Rhino'], S: ['Snake', 'Shark'], T: ['Tiger', 'Turtle'], U: ['Urial', 'Urubu'], V: ['Vulture', 'Viper'], W: ['Wolf', 'Whale'], Y: ['Yak', 'Yellowfin'] },
    Thing: { A: ['Airplane', 'Anchor'], B: ['Book', 'Bottle'], C: ['Chair', 'Clock'], D: ['Door', 'Drum'], E: ['Engine', 'Envelope'], F: ['Fan', 'Fork'], G: ['Glass', 'Globe'], H: ['Hammer', 'Hat'], I: ['Iron', 'Ink'], J: ['Jar', 'Jacket'], K: ['Knife', 'Key'], L: ['Lamp', 'Lock'], M: ['Mirror', 'Map'], N: ['Needle', 'Notebook'], O: ['Oven', 'Oil'], P: ['Pen', 'Phone'], R: ['Radio', 'Rope'], S: ['Spoon', 'Scissors'], T: ['Table', 'Torch'], U: ['Umbrella', 'Urn'], V: ['Vase', 'Violin'], W: ['Watch', 'Wallet'], Y: ['Yarn', 'Yoyo'] },
    Food: { A: ['Apple', 'Avocado'], B: ['Banana', 'Biryani'], C: ['Cake', 'Carrot'], D: ['Date', 'Donut'], E: ['Egg', 'Eggplant'], F: ['Fish', 'Fries'], G: ['Grapes', 'Guava'], H: ['Honey', 'Hummus'], I: ['Ice cream', 'Idli'], J: ['Jam', 'Juice'], K: ['Kebab', 'Kiwi'], L: ['Lemon', 'Lasagna'], M: ['Mango', 'Mushroom'], N: ['Noodles', 'Nutella'], O: ['Orange', 'Omelette'], P: ['Pizza', 'Pasta'], R: ['Rice', 'Roti'], S: ['Salad', 'Soup'], T: ['Taco', 'Toast'], U: ['Udon', 'Upma'], V: ['Vanilla', 'Vinegar'], W: ['Waffle', 'Watermelon'], Y: ['Yogurt', 'Yam'] },
    Movie: { A: ['Avatar', 'Alien'], B: ['Batman', 'Braveheart'], C: ['Casablanca', 'Coco'], D: ['Dune', 'Django'], E: ['Elf', 'Exodus'], F: ['Frozen', 'Fury'], G: ['Gladiator', 'Gravity'], H: ['Halloween', 'Her'], I: ['Inception', 'Interstellar'], J: ['Joker', 'Jungle Book'], K: ['Kill Bill', 'Knives Out'], L: ['Leon', 'Logan'], M: ['Matrix', 'Mulan'], N: ['Naruto', 'Nope'], O: ['Oppenheimer', 'Oldboy'], P: ['Parasite', 'Psycho'], R: ['Rocky', 'Ratatouille'], S: ['Shrek', 'Spectre'], T: ['Titanic', 'Tenet'], U: ['Uncut Gems', 'Us'], V: ['Venom', 'Vertigo'], W: ['Wall-E', 'Whiplash'], Y: ['Yesterday', 'You'] },
  };

  if (difficulty === 'easy' && Math.random() < 0.4) return '';

  const categoryAnswers = answers[category];
  if (!categoryAnswers) return '';
  const options = categoryAnswers[letter];
  if (!options) return '';

  if (difficulty === 'medium' && Math.random() < 0.2) return '';

  return options[Math.floor(Math.random() * options.length)];
}

function calculateScore(
  playerAnswer: string,
  botAnswer: string,
): number {
  if (!playerAnswer.trim()) return 0;
  if (playerAnswer.trim().toLowerCase() === botAnswer.trim().toLowerCase()) return 5;
  return 10;
}

export default function GameScreen() {
  const router = useRouter();
  const { difficulty = 'medium' } = useLocalSearchParams<{ difficulty: string }>();

  const totalRounds = DEFAULT_ROUNDS;
  const categories = DEFAULT_CATEGORIES;
  const timerDuration = TIMER_PER_CATEGORY[difficulty] * categories.length;

  const [phase, setPhase] = useState<Phase>('countdown');
  const [betweenRoundTimer, setBetweenRoundTimer] = useState(5);
  const [countdown, setCountdown] = useState(3);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentLetter, setCurrentLetter] = useState('');
  const [timeLeft, setTimeLeft] = useState(timerDuration);
  const [answers, setAnswers] = useState<string[]>(Array(categories.length).fill(''));
  const [botAnswers, setBotAnswers] = useState<string[]>([]);
  const [roundScores, setRoundScores] = useState<{ player: number; bot: number }[]>([]);

  const inputRefs = useRef<(TextInput | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function pickLetter() {
    return LETTERS[Math.floor(Math.random() * LETTERS.length)];
  }

  function startRound() {
    const letter = pickLetter();
    setCurrentLetter(letter);
    setAnswers(Array(categories.length).fill(''));
    setTimeLeft(timerDuration);
    setPhase('countdown');
    setCountdown(3);
  }

  useEffect(() => {
    startRound();
  }, [currentRound]);

  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown === 0) {
      setPhase('playing');
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  useEffect(() => {
    if (phase !== 'playing') return;
    if (timeLeft === 0) {
      endRound();
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          endRound();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'roundover') return;
    if (betweenRoundTimer === 0) {
      if (currentRound >= totalRounds) {
        const totalPlayer = roundScores.reduce((s, r) => s + r.player, 0);
        const totalBot = roundScores.reduce((s, r) => s + r.bot, 0);
        router.replace({
          pathname: '/results',
          params: {
            playerScore: totalPlayer,
            botScore: totalBot,
            rounds: JSON.stringify(roundScores),
            difficulty,
          },
        });
      } else {
        setCurrentRound(r => r + 1);
      }
      return;
    }
    const t = setTimeout(() => {
      setBetweenRoundTimer(b => b - 1);
    }, 1000);
    return () => clearTimeout(t);
  }, [phase, betweenRoundTimer]);

  function endRound() {
    if (timerRef.current) clearInterval(timerRef.current);

    const bAnswers = categories.map(cat =>
      getBotAnswer(cat, currentLetter, difficulty as string)
    );
    setBotAnswers(bAnswers);

    const playerScore = answers.reduce((total, ans, i) => {
      return total + calculateScore(ans, bAnswers[i]);
    }, 0);

    const botScore = bAnswers.reduce((total, ans, i) => {
      if (!ans.trim()) return total;
      return total + calculateScore(ans, answers[i]);
    }, 0);

    setRoundScores(prev => [...prev, { player: playerScore, bot: botScore }]);
    setBetweenRoundTimer(5);
    setPhase('roundover');
  }

  function handleStop() {
    if (phase !== 'playing') return;
    endRound();
  }

  function handleNextRound() {
    if (currentRound >= totalRounds) {
      const totalPlayer = roundScores.reduce((s, r) => s + r.player, 0);
      const totalBot = roundScores.reduce((s, r) => s + r.bot, 0);
      router.replace({
        pathname: '/results',
        params: {
          playerScore: totalPlayer,
          botScore: totalBot,
          rounds: JSON.stringify(roundScores),
          difficulty,
        },
      });
    } else {
      setBetweenRoundTimer(5);
      setPhase('between');
    }
  }

  function handleAnswerChange(text: string, index: number) {
    const newAnswers = [...answers];
    newAnswers[index] = text;
    setAnswers(newAnswers);
  }

  function handleSubmitEditing(index: number) {
    if (index < categories.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  const timerColor = timeLeft <= 10
    ? COLORS.danger
    : timeLeft <= 20
      ? COLORS.warning
      : COLORS.primary;

  if (phase === 'countdown') {
    return (
      <View style={styles.container}>
        <View style={styles.blob1} />
        <View style={styles.blob2} />
        <View style={styles.countdownContainer}>
          <Text style={styles.roundLabel}>Round {currentRound} of {totalRounds}</Text>
          <Text style={styles.countdownNumber}>
            {countdown === 0 ? 'GO!' : countdown}
          </Text>
          <Text style={styles.countdownSub}>Get Ready...</Text>
        </View>
      </View>
    );
  }

  if (phase === 'roundover') {
    const lastScore = roundScores[roundScores.length - 1];
    const isLastRound = currentRound >= totalRounds;

    return (
      <View style={styles.container}>
        <View style={styles.blob1} />
        <View style={styles.blob2} />

        <View style={styles.countdownContainer}>

          {/* Letter */}
          <Text style={styles.letterDisplay}>{currentLetter}</Text>

          {/* Round scores */}
          <View style={styles.scoreRow}>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreLabel}>YOU</Text>
              <Text style={styles.scoreNumber}>{lastScore?.player ?? 0}</Text>
            </View>
            <View style={styles.scoreDivider} />
            <View style={styles.scoreBox}>
              <Text style={styles.scoreLabel}>BOT</Text>
              <Text style={styles.scoreNumber}>{lastScore?.bot ?? 0}</Text>
            </View>
          </View>

          {/* Answer comparison */}
          <View style={styles.answerReviewStatic}>
            {categories.map((cat, i) => (
              <View key={cat} style={styles.reviewRow}>
                <Text style={styles.reviewCat}>{cat}</Text>
                <Text style={[
                  styles.reviewAns,
                  { color: answers[i] ? COLORS.secondary : COLORS.textMuted }
                ]}>
                  {answers[i] || '—'}
                </Text>
                <Text style={styles.reviewVs}>vs</Text>
                <Text style={[
                  styles.reviewAns,
                  { color: botAnswers[i] ? COLORS.danger : COLORS.textMuted }
                ]}>
                  {botAnswers[i] || '—'}
                </Text>
              </View>
            ))}
          </View>

          {/* Auto next round countdown */}
          <View style={styles.autoNextWrap}>
            <Text style={styles.autoNextText}>
              {isLastRound
                ? `Final results in ${betweenRoundTimer}s...`
                : `Round ${currentRound + 1} starts in ${betweenRoundTimer}s...`
              }
            </Text>
            <View style={styles.autoNextTrack}>
              <View style={[
                styles.autoNextBar,
                { width: `${(betweenRoundTimer / 5) * 100}%` }
              ]} />
            </View>
          </View>

        </View>
      </View>
    );
  }
  if (phase === 'between') {
    return (
      <View style={styles.container}>
        <View style={styles.blob1} />
        <View style={styles.blob2} />
        <View style={styles.countdownContainer}>
          <Text style={styles.roundLabel}>
            Round {currentRound + 1} starts in
          </Text>
          <Text style={styles.countdownNumber}>{betweenRoundTimer}</Text>
          <Text style={styles.countdownSub}>Get ready for next round!</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.blob1} />
      <View style={styles.blob2} />

      <View style={styles.topBar}>
        <Text style={styles.roundLabel}>Round {currentRound}/{totalRounds}</Text>
        <View style={[styles.timerCircle, { borderColor: timerColor }]}>
          <Text style={[styles.timerText, { color: timerColor }]}>{timeLeft}</Text>
        </View>
        <Text style={styles.diffLabel}>{(difficulty as string).toUpperCase()}</Text>
      </View>

      <View style={styles.letterCard}>
        <Text style={styles.letterHint}>Current Letter</Text>
        <Text style={styles.letterDisplay}>{currentLetter}</Text>
      </View>

      <ScrollView
        style={styles.inputList}
        keyboardShouldPersistTaps="handled"
      >
        {categories.map((cat, i) => (
          <View key={cat} style={styles.inputRow}>
            <Text style={styles.catLabel}>{cat}</Text>
            <TextInput
              ref={ref => { inputRefs.current[i] = ref; }}
              style={styles.input}
              placeholder={`${currentLetter}...`}
              placeholderTextColor={COLORS.border}
              value={answers[i]}
              onChangeText={text => handleAnswerChange(text, i)}
              onSubmitEditing={() => handleSubmitEditing(i)}
              returnKeyType={i < categories.length - 1 ? 'next' : 'done'}
              editable={phase === 'playing'}
              autoCapitalize="words"
            />
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.stopBtn}
        onPress={handleStop}
        activeOpacity={0.85}
      >
        <Text style={styles.stopBtnText}>⏹ STOP!</Text>
      </TouchableOpacity>

    </KeyboardAvoidingView>
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
    backgroundColor: COLORS.primary,
    opacity: 0.06,
    top: -80,
    right: -80,
  },
  blob2: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: COLORS.secondary,
    opacity: 0.05,
    bottom: -60,
    left: -60,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
  },
  roundLabel: {
    fontSize: FONTS.small,
    color: COLORS.textMuted,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: SPACING.xxl,
    marginBottom: SPACING.md,
  },
  timerCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: FONTS.large,
    fontWeight: '900',
  },
  diffLabel: {
    fontSize: FONTS.small,
    color: COLORS.textMuted,
    fontWeight: '700',
  },
  letterCard: {
    width: '100%',
    backgroundColor: 'rgba(255,140,0,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,140,0,0.2)',
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    marginBottom: SPACING.md,
  },
  letterHint: {
    fontSize: FONTS.small,
    color: COLORS.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  letterDisplay: {
    fontSize: 64,
    fontWeight: '900',
    color: COLORS.primary,
    lineHeight: 72,
    textAlign: 'center',
  },
  inputList: {
    flex: 1,
    marginBottom: SPACING.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  catLabel: {
    width: 60,
    fontSize: FONTS.small,
    color: COLORS.textMuted,
    fontWeight: '600',
    textAlign: 'right',
  },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    color: COLORS.white,
    fontSize: FONTS.body,
  },
  stopBtn: {
    width: '100%',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.danger,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  stopBtnText: {
    fontSize: FONTS.medium,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 1,
  },
  countdownContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownNumber: {
    fontSize: 120,
    fontWeight: '900',
    color: COLORS.primary,
    textAlign: 'center',
  },
  countdownSub: {
    fontSize: FONTS.medium,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.xl,
    marginVertical: SPACING.lg,
  },
  scoreBox: {
    alignItems: 'center',
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
  scoreDivider: {
    width: 1,
    height: 60,
    backgroundColor: COLORS.border,
  },
  answerReview: {
    flex: 1,
    marginBottom: SPACING.md,
  },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.sm,
  },
  reviewCat: {
    width: 55,
    fontSize: FONTS.small,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  reviewAns: {
    flex: 1,
    fontSize: FONTS.small,
    fontWeight: '600',
  },
  reviewVs: {
    fontSize: FONTS.small,
    color: COLORS.border,
  },
  nextBtn: {
    width: '100%',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  nextBtnText: {
    fontSize: FONTS.medium,
    fontWeight: '900',
    color: COLORS.white,
  },
  answerReviewStatic: {
    width: '100%',
    marginBottom: SPACING.md,
  },
  autoNextWrap: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
  },
  autoNextText: {
    fontSize: FONTS.body,
    color: COLORS.textMuted,
    fontWeight: '600',
    textAlign: 'center',
  },
  autoNextTrack: {
    width: '60%',
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  autoNextBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
});