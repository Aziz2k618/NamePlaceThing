import { useLocalSearchParams, useRouter } from 'expo-router';
import { onDisconnect, onValue, ref, set, update } from 'firebase/database';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../constants/theme';
import { auth, rtdb } from '../firebaseConfig';

type Player = { uid: string; name: string; ready: boolean };

export default function WaitingRoomScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();
  const uid = auth.currentUser?.uid;

  const [players, setPlayers] = useState<Player[]>([]);
  const [hostId, setHostId] = useState('');
  const [category, setCategory] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(0);
  const [starting, setStarting] = useState(false);
  const [originalHostId, setOriginalHostId] = useState('');

  useEffect(() => {
    if (!code) return;
    const lobbyRef = ref(rtdb, `lobbies/${code}`);

    const unsubscribe = onValue(lobbyRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      setHostId(data.host);
      setOriginalHostId(data.originalHost);
      setCategory(data.category);
      setMaxPlayers(data.maxPlayers);

      const list: Player[] = data.players
        ? Object.entries(data.players).map(([pUid, p]: [string, any]) => ({
          uid: pUid,
          name: p.name,
          ready: p.ready,
        }))
        : [];
      setPlayers(list);

      // If host started the game, everyone navigates to game screen
      if (data.status === 'playing') {
        router.replace({ pathname: '/multiplayer-game', params: { code } });
      }
    });

    return () => unsubscribe();
  }, [code]);

  useEffect(() => {
    if (!code || !uid) return;
    const connRef = ref(rtdb, `lobbies/${code}/players/${uid}/connected`);
    set(connRef, true);
    onDisconnect(connRef).set(false);
  }, [code, uid]);

  useEffect(() => {
    if (!code || !players || Object.keys(players).length === 0) return;

    const entries = Object.entries(players).map(([pUid, p]: [string, any]) => ({
      uid: pUid, connected: p.connected !== false, joinedAt: p.joinedAt,
    }));

    const originalHostPlayer = entries.find(p => p.uid === originalHostId);
    const currentHostPlayer = entries.find(p => p.uid === hostId);

    if (originalHostPlayer?.connected && hostId !== originalHostId) {
      update(ref(rtdb, `lobbies/${code}`), { host: originalHostId });
      return;
    }

    if (currentHostPlayer && !currentHostPlayer.connected) {
      const candidates = entries.filter(p => p.connected && p.uid !== hostId)
        .sort((a, b) => a.joinedAt - b.joinedAt);
      if (candidates.length > 0) {
        update(ref(rtdb, `lobbies/${code}`), { host: candidates[0].uid });
      }
    }
  }, [players, hostId, originalHostId]);

  const isHost = uid === hostId;

  const handleStart = async () => {
    if (!code || players.length < 2) return;
    setStarting(true);
    try {
      await update(ref(rtdb, `lobbies/${code}`), { status: 'playing' });
    } catch (err) {
      console.error('Failed to start game:', err);
      setStarting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.codeLabel}>Room Code</Text>
      <Text style={styles.code}>{code}</Text>
      <Text style={styles.category}>{category} • {players.length}/{maxPlayers} players</Text>

      <FlatList
        style={styles.list}
        data={players}
        keyExtractor={(p) => p.uid}
        renderItem={({ item }) => (
          <View style={styles.playerRow}>
            <Text style={styles.playerName}>
              {item.name} {item.uid === hostId ? '👑' : ''}
            </Text>
          </View>
        )}
      />

      {isHost ? (
        <TouchableOpacity
          style={[styles.startButton, (players.length < 2 || starting) && { opacity: 0.5 }]}
          onPress={handleStart}
          disabled={players.length < 2 || starting}
        >
          <Text style={styles.startButtonText}>
            {starting ? 'Starting...' : players.length < 2 ? 'Need 2+ players' : 'Start Game'}
          </Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.waitingText}>Waiting for host to start...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundDark, padding: SPACING.lg },
  codeLabel: { color: COLORS.textMuted, fontSize: FONTS.small, textAlign: 'center', marginTop: SPACING.lg },
  code: { color: COLORS.primary, fontSize: FONTS.xxl, fontWeight: '900', textAlign: 'center', letterSpacing: 4 },
  category: { color: COLORS.textSecondary, fontSize: FONTS.body, textAlign: 'center', marginBottom: SPACING.lg },
  list: { flex: 1 },
  playerRow: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  playerName: { color: COLORS.white, fontSize: FONTS.medium, fontWeight: '600' },
  startButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  startButtonText: { color: COLORS.white, fontSize: FONTS.medium, fontWeight: '800' },
  waitingText: { color: COLORS.textMuted, textAlign: 'center', marginBottom: SPACING.lg },
});