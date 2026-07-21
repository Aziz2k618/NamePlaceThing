// lib/lobby.ts
import { get, ref, set } from 'firebase/database';
import { rtdb } from '../firebaseConfig';

export type JoinResult =
    | { success: true }
    | { success: false; reason: 'not_found' | 'full' | 'already_started' };

export async function joinLobby(code: string, uid: string, displayName: string): Promise<JoinResult> {
    const lobbyRef = ref(rtdb, `lobbies/${code}`);
    const snapshot = await get(lobbyRef);

    if (!snapshot.exists()) {
        return { success: false, reason: 'not_found' };
    }

    const lobby = snapshot.val();

    if (lobby.status !== 'waiting') {
        return { success: false, reason: 'already_started' };
    }

    const currentPlayers = lobby.players ? Object.keys(lobby.players).length : 0;
    if (currentPlayers >= lobby.maxPlayers) {
        return { success: false, reason: 'full' };
    }

    // Already in the lobby (rejoin case) — no error, just proceed
    if (lobby.players && lobby.players[uid]) {
        return { success: true };
    }

    await set(ref(rtdb, `lobbies/${code}/players/${uid}`), {
        name: displayName,
        joinedAt: Date.now(),
        ready: false,
    });

    return { success: true };
}