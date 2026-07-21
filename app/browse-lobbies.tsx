import { useRouter } from 'expo-router';
import { onValue, ref } from 'firebase/database';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../constants/theme';
import { auth, rtdb } from '../firebaseConfig';
import { joinLobby } from '../lib/lobby';

type LobbyListItem = {
    code: string;
    category: string;
    playerCount: number;
    maxPlayers: number;
};

export default function BrowseLobbiesScreen() {
    const router = useRouter();
    const [lobbies, setLobbies] = useState<LobbyListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [joiningCode, setJoiningCode] = useState<string | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const lobbiesRef = ref(rtdb, 'lobbies');

        const unsubscribe = onValue(
            lobbiesRef,
            (snapshot) => {
                const data = snapshot.val() || {};

                const list: LobbyListItem[] = Object.entries(data)
                    .filter(([_, lobby]: [string, any]) =>
                        lobby.visibility === 'public' && lobby.status === 'waiting'
                    )
                    .map(([code, lobby]: [string, any]) => ({
                        code,
                        category: lobby.category,
                        playerCount: lobby.players ? Object.keys(lobby.players).length : 0,
                        maxPlayers: lobby.maxPlayers,
                    }))
                    .filter((l) => l.playerCount < l.maxPlayers);

                setLobbies(list);
                setLoading(false);
            },
            (err) => {
                console.error('Browse lobbies read error:', err);
                setError('Failed to load lobbies: ' + err.message);
                setLoading(false);
            }
        );
        return () => unsubscribe();
    }, []);

    const handleJoin = async (code: string) => {
        const user = auth.currentUser;
        if (!user) return;

        setJoiningCode(code);
        setError('');

        try {
            const result = await joinLobby(code, user.uid, 'Player');

            if (!result.success) {
                setError('Could not join — lobby may have filled up.');
                setJoiningCode(null);
                return;
            }

            router.replace({ pathname: '/waiting-room', params: { code } });
        } catch (err) {
            console.error('Failed to join lobby:', err);
            setError('Something went wrong. Try again.');
            setJoiningCode(null);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Public Lobbies</Text>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            {loading ? (
                <Text style={styles.empty}>Loading...</Text>
            ) : lobbies.length === 0 ? (
                <Text style={styles.empty}>No public lobbies right now. Try creating one!</Text>
            ) : (
                <FlatList
                    data={lobbies}
                    keyExtractor={(item) => item.code}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.card}
                            onPress={() => handleJoin(item.code)}
                            disabled={joiningCode !== null}
                        >
                            <View>
                                <Text style={styles.cardCategory}>{item.category}</Text>
                                <Text style={styles.cardPlayers}>
                                    {item.playerCount}/{item.maxPlayers} players
                                </Text>
                            </View>
                            <Text style={styles.joinText}>
                                {joiningCode === item.code ? 'Joining...' : 'Join →'}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.backgroundDark,
        padding: SPACING.lg,
    },
    title: {
        color: COLORS.white,
        fontSize: FONTS.xl,
        fontWeight: '900',
        marginBottom: SPACING.lg,
    },
    empty: {
        color: COLORS.textMuted,
        fontSize: FONTS.body,
        textAlign: 'center',
        marginTop: SPACING.xxl,
    },
    error: {
        color: COLORS.danger,
        fontSize: FONTS.small,
        marginBottom: SPACING.md,
    },
    card: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.card,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.md,
    },
    cardCategory: {
        color: COLORS.white,
        fontSize: FONTS.medium,
        fontWeight: '700',
    },
    cardPlayers: {
        color: COLORS.textMuted,
        fontSize: FONTS.small,
        marginTop: 2,
    },
    joinText: {
        color: COLORS.primary,
        fontWeight: '700',
    },
});