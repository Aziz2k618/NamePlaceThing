import { useRouter } from 'expo-router';
import { ref, set } from 'firebase/database';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../constants/theme';
import { auth, rtdb } from '../firebaseConfig';

const CATEGORIES = ['Animal', 'Place', 'Thing', 'Mixed'];
const TIMERS = [30, 60, 90];
const MAX_PLAYERS_OPTIONS = [4, 6, 8]; // 8 could later be gated behind premium

function generateLobbyCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars (0/O, 1/I)
    let code = '';
    for (let i = 0; i < 5; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

export default function CreateLobbyScreen() {
    const router = useRouter();

    const [category, setCategory] = useState(CATEGORIES[0]);
    const [roundTimer, setRoundTimer] = useState(TIMERS[1]);
    const [maxPlayers, setMaxPlayers] = useState(MAX_PLAYERS_OPTIONS[1]);
    const [visibility, setVisibility] = useState<'public' | 'private'>('private');
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState('');

    const handleCreate = async () => {
        const user = auth.currentUser;
        if (!user) {
            setError('Not signed in yet — try again in a moment.');
            return;
        }

        setCreating(true);
        setError('');

        try {
            const code = generateLobbyCode();

            await set(ref(rtdb, `lobbies/${code}`), {
                host: user.uid,
                originalHost: user.uid,
                visibility,
                status: 'waiting',
                category,
                roundTimer,
                maxPlayers,
                createdAt: Date.now(),
                players: {
                    [user.uid]: {
                        name: 'Host', // swap for real display name once profile screen is built
                        joinedAt: Date.now(),
                        ready: false,
                        connected: true,
                    },
                },
            });

            router.replace({ pathname: '/waiting-room', params: { code } });
        } catch (err: any) {
            console.error('Failed to create lobby:', err);
            setError('Could not create lobby. Try again.');
        } finally {
            setCreating(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Create Lobby</Text>

            <Text style={styles.label}>Category</Text>
            <View style={styles.rowWrap}>
                {CATEGORIES.map((c) => (
                    <TouchableOpacity
                        key={c}
                        style={[styles.chip, category === c && styles.chipActive]}
                        onPress={() => setCategory(c)}
                    >
                        <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{c}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.label}>Round Timer</Text>
            <View style={styles.rowWrap}>
                {TIMERS.map((t) => (
                    <TouchableOpacity
                        key={t}
                        style={[styles.chip, roundTimer === t && styles.chipActive]}
                        onPress={() => setRoundTimer(t)}
                    >
                        <Text style={[styles.chipText, roundTimer === t && styles.chipTextActive]}>{t}s</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.label}>Max Players</Text>
            <View style={styles.rowWrap}>
                {MAX_PLAYERS_OPTIONS.map((m) => (
                    <TouchableOpacity
                        key={m}
                        style={[styles.chip, maxPlayers === m && styles.chipActive]}
                        onPress={() => setMaxPlayers(m)}
                    >
                        <Text style={[styles.chipText, maxPlayers === m && styles.chipTextActive]}>{m}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.label}>Visibility</Text>
            <View style={styles.rowWrap}>
                <TouchableOpacity
                    style={[styles.chip, visibility === 'private' && styles.chipActive]}
                    onPress={() => setVisibility('private')}
                >
                    <Text style={[styles.chipText, visibility === 'private' && styles.chipTextActive]}>
                        🔒 Private
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.chip, visibility === 'public' && styles.chipActive]}
                    onPress={() => setVisibility('public')}
                >
                    <Text style={[styles.chipText, visibility === 'public' && styles.chipTextActive]}>
                        🌐 Public
                    </Text>
                </TouchableOpacity>
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
                style={[styles.createButton, creating && { opacity: 0.6 }]}
                onPress={handleCreate}
                disabled={creating}
            >
                <Text style={styles.createButtonText}>
                    {creating ? 'Creating...' : 'Create Lobby'}
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.backgroundDark,
    },
    content: {
        padding: SPACING.lg,
        paddingBottom: SPACING.xxl,
    },
    title: {
        color: COLORS.white,
        fontSize: FONTS.xl,
        fontWeight: '900',
        marginBottom: SPACING.lg,
    },
    label: {
        color: COLORS.textSecondary,
        fontSize: FONTS.body,
        fontWeight: '600',
        marginBottom: SPACING.sm,
        marginTop: SPACING.md,
    },
    rowWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
    },
    chip: {
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.card,
        borderRadius: RADIUS.full,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
    },
    chipActive: {
        borderColor: COLORS.primary,
        backgroundColor: 'rgba(255,140,0,0.15)',
    },
    chipText: {
        color: COLORS.textMuted,
        fontSize: FONTS.body,
        fontWeight: '600',
    },
    chipTextActive: {
        color: COLORS.primary,
    },
    error: {
        color: COLORS.danger,
        fontSize: FONTS.small,
        marginTop: SPACING.md,
    },
    createButton: {
        backgroundColor: COLORS.primary,
        borderRadius: RADIUS.lg,
        paddingVertical: SPACING.md,
        alignItems: 'center',
        marginTop: SPACING.xl,
    },
    createButtonText: {
        color: COLORS.white,
        fontSize: FONTS.medium,
        fontWeight: '800',
    },
});