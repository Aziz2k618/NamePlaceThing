import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../constants/theme';
import { auth } from '../firebaseConfig';
import { joinLobby } from '../lib/lobby';

const ERROR_MESSAGES: Record<string, string> = {
    not_found: 'Lobby not found. Check the code and try again.',
    full: 'This lobby is full.',
    already_started: 'This game has already started.',
};

export default function JoinCodeScreen() {
    const router = useRouter();
    const [code, setCode] = useState('');
    const [joining, setJoining] = useState(false);
    const [error, setError] = useState('');

    const handleJoin = async () => {
        const user = auth.currentUser;
        if (!user) {
            setError('Not signed in yet — try again in a moment.');
            return;
        }
        if (code.trim().length < 4) {
            setError('Enter a valid code.');
            return;
        }

        setJoining(true);
        setError('');

        const cleanCode = code.trim().toUpperCase();

        try {
            const result = await joinLobby(cleanCode, user.uid, 'Player');

            if (!result.success) {
                setError(ERROR_MESSAGES[result.reason]);
                setJoining(false);
                return;
            }

            router.replace({ pathname: '/waiting-room', params: { code: cleanCode } });
        } catch (err) {
            console.error('Failed to join lobby:', err);
            setError('Something went wrong. Try again.');
            setJoining(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Join with Code</Text>
            <Text style={styles.subtitle}>Enter the code your friend shared</Text>

            <TextInput
                style={styles.input}
                value={code}
                onChangeText={(t) => setCode(t.toUpperCase())}
                placeholder="ABCDE"
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="characters"
                maxLength={5}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
                style={[styles.button, joining && { opacity: 0.6 }]}
                onPress={handleJoin}
                disabled={joining}
            >
                <Text style={styles.buttonText}>{joining ? 'Joining...' : 'Join Lobby'}</Text>
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
        fontSize: FONTS.xl,
        fontWeight: '900',
        marginBottom: SPACING.xs,
    },
    subtitle: {
        color: COLORS.textSecondary,
        fontSize: FONTS.body,
        marginBottom: SPACING.xl,
    },
    input: {
        backgroundColor: COLORS.card,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        color: COLORS.white,
        fontSize: FONTS.large,
        fontWeight: '800',
        letterSpacing: 4,
        textAlign: 'center',
        marginBottom: SPACING.md,
    },
    error: {
        color: COLORS.danger,
        fontSize: FONTS.small,
        marginBottom: SPACING.md,
    },
    button: {
        backgroundColor: COLORS.primary,
        borderRadius: RADIUS.lg,
        paddingVertical: SPACING.md,
        alignItems: 'center',
    },
    buttonText: {
        color: COLORS.white,
        fontSize: FONTS.medium,
        fontWeight: '800',
    },
});