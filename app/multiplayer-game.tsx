import { useLocalSearchParams, useRouter } from 'expo-router';
import { onDisconnect, onValue, ref, set, update } from 'firebase/database';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { validateAnswer } from '../constants/dictionary/index';
import { COLORS, FONTS, RADIUS, SPACING } from '../constants/theme';
import { auth, rtdb } from '../firebaseConfig';

const LETTERS = 'ABCDEFGHIJKLMNOPRSTUVWY'.split('');
const CATEGORIES = ['Name', 'Place', 'Animal', 'Thing'];
const TOTAL_ROUNDS = 4;
const REVEAL_HOLD_SECONDS = 5;
const GRACE_SECONDS = 30;

export default function MultiplayerGameScreen() {
    const { code } = useLocalSearchParams<{ code: string }>();
    const router = useRouter();
    const uid = auth.currentUser?.uid;

    const [roundTimer, setRoundTimer] = useState(60);
    const [hostId, setHostId] = useState('');
    const [players, setPlayers] = useState<Record<string, any>>({});

    const [roundNumber, setRoundNumber] = useState(0);
    const [letter, setLetter] = useState('');
    const [phase, setPhase] = useState<'waiting' | 'playing' | 'reveal' | 'gameover'>('waiting');
    const [revealEndTime, setRevealEndTime] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [revealTimeLeft, setRevealTimeLeft] = useState(REVEAL_HOLD_SECONDS);
    const [answers, setAnswers] = useState<string[]>(Array(CATEGORIES.length).fill(''));
    const [allAnswers, setAllAnswers] = useState<Record<string, string[]>>({});
    const [submitted, setSubmitted] = useState(false);
    const [totalScores, setTotalScores] = useState<Record<string, number>>({});
    const [lastRoundScores, setLastRoundScores] = useState<Record<string, number>>({});
    const [disconnectedPlayer, setDisconnectedPlayer] = useState<{ uid: string; deadline: number } | null>(null);
    const [graceTimeLeft, setGraceTimeLeft] = useState(0);

    const usedLettersRef = useRef<string[]>([]);
    const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const revealTickRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const inputRefs = useRef<(TextInput | null)[]>([]);
    const scoresComputedForRound = useRef<number>(0);

    const isHost = uid === hostId;

    // Lobby settings/players
    useEffect(() => {
        if (!code) return;
        const lobbyRef = ref(rtdb, `lobbies/${code}`);
        const unsub = onValue(lobbyRef, (snap) => {
            const data = snap.val();
            if (!data) return;
            setRoundTimer(data.roundTimer);
            setHostId(data.host);
            setPlayers(data.players || {});
        });
        return () => unsub();
    }, [code]);

    //Presence tracking
    useEffect(() => {
        if (!code || !uid) return;
        const connRef = ref(rtdb, `lobbies/${code}/players/${uid}/connected`);
        const discRef = ref(rtdb, `lobbies/${code}/players/${uid}/disconnectedAt`);
        set(connRef, true);
        set(discRef, null);
        onDisconnect(connRef).set(false);
        onDisconnect(discRef).set(Date.now());
    }, [code, uid]);

    // Cumulative scores — everyone listens now
    useEffect(() => {
        if (!code) return;
        const scoresRef = ref(rtdb, `lobbies/${code}/scores`);
        const unsub = onValue(scoresRef, (snap) => {
            setTotalScores(snap.val() || {});
        });
        return () => unsub();
    }, [code]);

    // Round state
    useEffect(() => {
        if (!code) return;
        const roundRef = ref(rtdb, `lobbies/${code}/round`);
        const unsub = onValue(roundRef, (snap) => {
            const data = snap.val();
            if (!data) return;
            setRoundNumber(data.number);
            setLetter(data.letter);
            setPhase(data.phase);
            setRevealEndTime(data.revealEndTime || 0);

            if (data.phase === 'playing') {
                setAnswers(Array(CATEGORIES.length).fill(''));
                setSubmitted(false);
                setAllAnswers({});
                setTimeout(() => inputRefs.current[0]?.focus(), 100);
            }
        });
        return () => unsub();
    }, [code]);

    // Answers
    useEffect(() => {
        if (!code) return;
        const answersRef = ref(rtdb, `lobbies/${code}/answers`);
        const unsub = onValue(answersRef, (snap) => {
            const data = snap.val() || {};
            setAllAnswers(data);

            // Host: detect all players submitted → end round early
            if (isHost && phase === 'playing') {
                const connectedUids = Object.entries(players)
                    .filter(([_, p]: [string, any]) => p.connected !== false)
                    .map(([pUid]) => pUid);
                const submittedUids = Object.keys(data);
                if (connectedUids.length > 0 && connectedUids.every(u => submittedUids.includes(u))) {
                    endRoundNow();
                }
            }
        });
        return () => unsub();
    }, [code, isHost, phase, players]);

    useEffect(() => {
        if (phase !== 'playing') { setDisconnectedPlayer(null); return; }

        const submittedUids = Object.keys(allAnswers);
        const stuck = Object.entries(players).find(([pUid, p]: [string, any]) =>
            p.connected === false && !submittedUids.includes(pUid) && (p.disconnectsUsed || 0) < 2
        );

        if (stuck) {
            const [pUid, p]: [string, any] = stuck;
            const deadline = (p.disconnectedAt || Date.now()) + GRACE_SECONDS * 1000;
            setDisconnectedPlayer({ uid: pUid, deadline });
        } else {
            setDisconnectedPlayer(null);
        }
    }, [players, allAnswers, phase]);

    useEffect(() => {
        if (!disconnectedPlayer) return;
        const t = setInterval(() => {
            const remaining = Math.max(0, Math.ceil((disconnectedPlayer.deadline - Date.now()) / 1000));
            setGraceTimeLeft(remaining);
            if (remaining <= 0 && isHost) {
                update(ref(rtdb, `lobbies/${code}/players/${disconnectedPlayer.uid}`), {
                    disconnectsUsed: ((players[disconnectedPlayer.uid]?.disconnectsUsed) || 0) + 1,
                });
                set(ref(rtdb, `lobbies/${code}/answers/${disconnectedPlayer.uid}`), Array(CATEGORIES.length).fill(''));
            }
        }, 500);
        return () => clearInterval(t);
    }, [disconnectedPlayer, isHost]);

    // Host: kick off round 1 if none exists
    useEffect(() => {
        if (!code || !isHost || !hostId) return;
        const roundRef = ref(rtdb, `lobbies/${code}/round`);
        onValue(roundRef, (snap) => {
            if (!snap.exists()) startRound(1);
        }, { onlyOnce: true });
    }, [isHost, hostId, code]);

    function pickLetter(): string {
        const available = LETTERS.filter(l => !usedLettersRef.current.includes(l));
        const pool = available.length ? available : LETTERS;
        const chosen = pool[Math.floor(Math.random() * pool.length)];
        usedLettersRef.current.push(chosen);
        return chosen;
    }

    async function startRound(num: number) {
        const newLetter = pickLetter();
        const endTime = Date.now() + roundTimer * 1000;
        await set(ref(rtdb, `lobbies/${code}/answers`), null);
        await set(ref(rtdb, `lobbies/${code}/round`), {
            number: num,
            letter: newLetter,
            endTime,
            phase: 'playing',
        });
    }

    // Host-only: compute scores + move to reveal (called on timeout OR all-submitted)
    async function endRoundNow() {
        if (scoresComputedForRound.current === roundNumber) return; // avoid double-run
        scoresComputedForRound.current = roundNumber;

        const snap = await new Promise<any>((resolve) => {
            onValue(ref(rtdb, `lobbies/${code}/answers`), (s) => resolve(s.val() || {}), { onlyOnce: true });
        });

        const playerUids = Object.keys(players);
        const roundScores: Record<string, number> = {};

        playerUids.forEach((pUid) => {
            const pAnswers = snap[pUid] || [];
            let total = 0;
            CATEGORIES.forEach((cat, i) => {
                const ans = (pAnswers[i] || '').trim();
                if (!ans) return;
                if (ans[0].toUpperCase() !== letter.toUpperCase()) return;
                if (!validateAnswer(cat, letter, ans)) return;

                const sharedWithSomeoneElse = playerUids.some((otherUid) => {
                    if (otherUid === pUid) return false;
                    const otherAns = (snap[otherUid]?.[i] || '').trim().toLowerCase();
                    return otherAns === ans.toLowerCase();
                });
                total += sharedWithSomeoneElse ? 5 : 10;
            });
            roundScores[pUid] = total;
        });

        // Merge into cumulative totals
        const currentTotals = await new Promise<Record<string, number>>((resolve) => {
            onValue(ref(rtdb, `lobbies/${code}/scores`), (s) => resolve(s.val() || {}), { onlyOnce: true });
        });
        const newTotals: Record<string, number> = { ...currentTotals };
        playerUids.forEach((pUid) => {
            newTotals[pUid] = (currentTotals[pUid] || 0) + roundScores[pUid];
        });

        await update(ref(rtdb, `lobbies/${code}`), { scores: newTotals });
        await update(ref(rtdb, `lobbies/${code}/round`), {
            phase: 'reveal',
            revealEndTime: Date.now() + REVEAL_HOLD_SECONDS * 1000,
            lastRoundScores: roundScores,
        });
    }

    // Track last round scores for display (everyone reads this from round node)
    useEffect(() => {
        if (!code) return;
        const r = ref(rtdb, `lobbies/${code}/round/lastRoundScores`);
        const unsub = onValue(r, (snap) => setLastRoundScores(snap.val() || {}));
        return () => unsub();
    }, [code]);

    // Playing timer — synced via endTime
    useEffect(() => {
        if (phase !== 'playing') {
            if (tickRef.current) clearInterval(tickRef.current);
            return;
        }
        const roundRef = ref(rtdb, `lobbies/${code}/round`);
        let endTimeCache = 0;
        onValue(roundRef, (snap) => { endTimeCache = snap.val()?.endTime || 0; }, { onlyOnce: true });

        tickRef.current = setInterval(() => {
            const remaining = Math.max(0, Math.ceil((endTimeCache - Date.now()) / 1000));
            setTimeLeft(remaining);
            if (remaining <= 0) {
                clearInterval(tickRef.current!);
                if (isHost) endRoundNow();
            }
        }, 250);
        return () => { if (tickRef.current) clearInterval(tickRef.current); };
    }, [phase]);

    // Reveal auto-advance timer — synced via revealEndTime, host triggers next/gameover
    useEffect(() => {
        if (phase !== 'reveal' || !revealEndTime) {
            if (revealTickRef.current) clearInterval(revealTickRef.current);
            return;
        }

        revealTickRef.current = setInterval(() => {
            const remaining = Math.max(0, Math.ceil((revealEndTime - Date.now()) / 1000));
            setRevealTimeLeft(remaining);
            if (remaining <= 0) {
                clearInterval(revealTickRef.current!);
                if (isHost) {
                    if (roundNumber >= TOTAL_ROUNDS) {
                        update(ref(rtdb, `lobbies/${code}/round`), { phase: 'gameover' });
                        update(ref(rtdb, `lobbies/${code}`), { status: 'finished' });
                    } else {
                        startRound(roundNumber + 1);
                    }
                }
            }
        }, 250);

        return () => { if (revealTickRef.current) clearInterval(revealTickRef.current); };
    }, [phase, revealEndTime]);

    function handleAnswerChange(text: string, index: number) {
        const next = [...answers];
        next[index] = text;
        setAnswers(next);
    }

    function handleSubmitEditing(index: number) {
        if (index < CATEGORIES.length - 1) inputRefs.current[index + 1]?.focus();
    }

    async function handleSubmit() {
        if (!uid || submitted) return;
        await set(ref(rtdb, `lobbies/${code}/answers/${uid}`), answers);
        setSubmitted(true);
    }

    const playerNames = Object.entries(players).reduce((acc, [pUid, p]: [string, any]) => {
        acc[pUid] = p.name;
        return acc;
    }, {} as Record<string, string>);

    if (phase === 'gameover') {
        const sorted = Object.entries(totalScores).sort((a, b) => b[1] - a[1]);
        return (
            <View style={styles.container}>
                <Text style={styles.roundLabel}>Final Results 🏆</Text>
                <ScrollView style={{ width: '100%' }}>
                    {sorted.map(([pUid, score], idx) => (
                        <View key={pUid} style={styles.playerBlock}>
                            <View style={styles.playerHeader}>
                                <Text style={styles.answerName}>{idx === 0 ? '👑 ' : ''}{playerNames[pUid]}</Text>
                                <Text style={styles.scoreText}>{score} pts</Text>
                            </View>
                        </View>
                    ))}
                </ScrollView>
                <TouchableOpacity style={styles.button} onPress={() => router.replace('/home')}>
                    <Text style={styles.buttonText}>Back to Home</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (phase === 'waiting' || !letter) {
        return (
            <View style={styles.container}>
                <Text style={styles.info}>Starting round...</Text>
            </View>
        );
    }

    if (phase === 'reveal') {
        return (
            <View style={styles.container}>
                <Text style={styles.roundLabel}>Round {roundNumber}/{TOTAL_ROUNDS} — Letter {letter}</Text>
                <Text style={styles.info}>
                    {roundNumber >= TOTAL_ROUNDS ? `Final results in ${revealTimeLeft}s...` : `Next round in ${revealTimeLeft}s...`}
                </Text>
                <ScrollView style={{ width: '100%' }}>
                    {Object.entries(playerNames).map(([pUid, name]) => (
                        <View key={pUid} style={styles.playerBlock}>
                            <View style={styles.playerHeader}>
                                <Text style={styles.answerName}>{name}</Text>
                                <View style={{ flexDirection: 'row', gap: SPACING.md }}>
                                    <Text style={styles.roundScoreText}>+{lastRoundScores[pUid] ?? 0}</Text>
                                    <Text style={styles.scoreText}>{totalScores[pUid] ?? 0} pts total</Text>
                                </View>
                            </View>
                            {CATEGORIES.map((cat, i) => (
                                <View key={cat} style={styles.answerRow}>
                                    <Text style={styles.catLabel}>{cat}</Text>
                                    <Text style={styles.answerText}>{allAnswers[pUid]?.[i] || '—'}</Text>
                                </View>
                            ))}
                        </View>
                    ))}
                </ScrollView>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <Text style={styles.roundLabel}>Round {roundNumber}/{TOTAL_ROUNDS}</Text>
            <Text style={styles.timer}>{timeLeft}s</Text>
            {disconnectedPlayer && (
                <Text style={styles.info}>
                    Waiting for {playerNames[disconnectedPlayer.uid] || 'a player'} to reconnect... {graceTimeLeft}s
                </Text>
            )}
            <Text style={styles.letterDisplay}>{letter}</Text>

            <ScrollView style={{ width: '100%' }} keyboardShouldPersistTaps="handled">
                {CATEGORIES.map((cat, i) => (
                    <View key={cat} style={styles.inputRow}>
                        <Text style={styles.catLabelInput}>{cat}</Text>
                        <TextInput
                            ref={r => { inputRefs.current[i] = r; }}
                            style={styles.input}
                            value={answers[i]}
                            onChangeText={t => handleAnswerChange(t, i)}
                            onSubmitEditing={() => handleSubmitEditing(i)}
                            placeholder={`${letter}...`}
                            placeholderTextColor={COLORS.textMuted}
                            editable={!submitted}
                            autoCapitalize="words"
                            returnKeyType={i < CATEGORIES.length - 1 ? 'next' : 'done'}
                        />
                    </View>
                ))}
            </ScrollView>

            <TouchableOpacity
                style={[styles.button, submitted && { opacity: 0.5 }]}
                onPress={handleSubmit}
                disabled={submitted}
            >
                <Text style={styles.buttonText}>{submitted ? 'Submitted ✓ Waiting...' : 'Submit'}</Text>
            </TouchableOpacity>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.backgroundDark, padding: SPACING.lg, alignItems: 'center', justifyContent: 'center' },
    info: { color: COLORS.textMuted, fontSize: FONTS.body, marginBottom: SPACING.md, textAlign: 'center' },
    roundLabel: { color: COLORS.textSecondary, fontSize: FONTS.body, marginBottom: SPACING.sm },
    timer: { color: COLORS.primary, fontSize: FONTS.xl, fontWeight: '900' },
    letterDisplay: { color: COLORS.white, fontSize: 64, fontWeight: '900', marginVertical: SPACING.md },
    inputRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm, width: '100%' },
    catLabelInput: { width: 60, color: COLORS.textMuted, fontSize: FONTS.small, fontWeight: '600', textAlign: 'right' },
    input: {
        flex: 1, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border,
        borderRadius: RADIUS.md, padding: SPACING.sm, color: COLORS.white, fontSize: FONTS.body,
    },
    button: { backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl, marginTop: SPACING.md },
    buttonText: { color: COLORS.white, fontWeight: '800', fontSize: FONTS.medium },
    playerBlock: { marginBottom: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingBottom: SPACING.md, width: '100%' },
    playerHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs, alignItems: 'center' },
    answerName: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.medium },
    scoreText: { color: COLORS.primary, fontWeight: '800' },
    roundScoreText: { color: COLORS.secondary, fontWeight: '700' },
    answerRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
    catLabel: { color: COLORS.textMuted, fontSize: FONTS.small },
    answerText: { color: COLORS.textSecondary, fontSize: FONTS.small, fontWeight: '600' },
});