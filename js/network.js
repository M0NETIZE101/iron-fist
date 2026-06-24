/**
 * NETWORK - PeerJS Multiplayer Networking
 * Host-authoritative model: host runs game simulation, joiner sends inputs
 */

class GameNetwork {
    constructor(scene) {
        this.scene = scene;
        this.peer = null;
        this.connection = null;
        this.isHost = sessionStorage.getItem('online_is_host') === 'true';
        this.myPeerId = sessionStorage.getItem('online_peer_id');
        this.opponentPeerId = sessionStorage.getItem('online_opponent_peer_id');
        this.isConnected = false;
        this.remoteInputState = {
            left: false, right: false, jump: false,
            light: false, medium: false, heavy: false,
            special: false, block: false, super: false
        };
        this.lastSentState = null;
        this.inputQueue = [];
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    connect() {
        console.log(`[Network] Connecting as ${this.isHost ? 'HOST' : 'CLIENT'}`);
        console.log(`[Network] My Peer ID: ${this.myPeerId}`);
        console.log(`[Network] Opponent Peer ID: ${this.opponentPeerId}`);

        if (!this.myPeerId) {
            console.error('[Network] No peer ID found in sessionStorage');
            this.scene.onNetworkDisconnected();
            return;
        }

        this.peer = new Peer(this.myPeerId, {
            debug: 2,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            }
        });

        this.peer.on('open', (id) => {
            console.log(`[Network] Peer open: ${id}`);
            if (this.isHost) {
                // Host: wait for client to connect
                console.log('[Network] Host waiting for client connection...');
            } else {
                // Client: connect to host
                console.log(`[Network] Client connecting to host: ${this.opponentPeerId}`);
                this.attemptConnection();
            }
        });

        if (this.isHost) {
            // Host: listen for incoming connections
            this.peer.on('connection', (conn) => {
                console.log(`[Network] Host: Incoming connection from ${conn.peer}`);
                this.setupConnection(conn);
            });
        }

        this.peer.on('disconnected', () => {
            console.log('[Network] Disconnected from signaling server');
            // Attempt to reconnect
            if (this.peer && !this.peer.destroyed) {
                this.peer.reconnect();
            }
        });

        this.peer.on('error', (err) => {
            console.error('[Network] Peer error:', err);
            this.scene.onNetworkDisconnected();
        });
    }

    attemptConnection() {
        if (!this.opponentPeerId) {
            console.error('[Network] No opponent peer ID to connect to');
            this.scene.onNetworkDisconnected();
            return;
        }

        console.log(`[Network] Connecting to ${this.opponentPeerId}...`);
        const conn = this.peer.connect(this.opponentPeerId, { reliable: true });
        this.setupConnection(conn);
    }

    setupConnection(conn) {
        this.connection = conn;

        conn.on('open', () => {
            console.log(`[Network] Connection open with ${conn.peer}`);
            this.isConnected = true;
            this.scene.onNetworkReady();
        });

        conn.on('data', (data) => {
            this.handleData(data);
        });

        conn.on('close', () => {
            console.log('[Network] Connection closed');
            this.isConnected = false;
            this.scene.onNetworkDisconnected();
        });

        conn.on('error', (err) => {
            console.error('[Network] Connection error:', err);
            this.isConnected = false;
            this.scene.onNetworkDisconnected();
        });
    }

    handleData(data) {
        try {
            switch (data.type) {
                case 'input':
                    this.remoteInputState = data.state;
                    break;
                case 'game_state':
                    this.scene.applyRemoteGameState(data.state);
                    break;
                case 'game_event':
                    this.scene.applyRemoteEvent(data.event);
                    break;
                default:
                    console.warn('[Network] Unknown data type:', data.type);
            }
        } catch (e) {
            console.error('[Network] Error handling data:', e);
        }
    }

    sendInput(inputState) {
        if (!this.isConnected || !this.connection) return;
        const stateStr = JSON.stringify(inputState);
        if (stateStr !== this.lastSentState) {
            try {
                this.connection.send({ type: 'input', state: inputState });
                this.lastSentState = stateStr;
            } catch (e) {
                console.warn('[Network] Failed to send input:', e);
            }
        }
    }

    sendGameState(gameState) {
        if (!this.isConnected || !this.connection) return;
        try {
            this.connection.send({ type: 'game_state', state: gameState });
        } catch (e) {
            console.warn('[Network] Failed to send game state:', e);
        }
    }

    sendGameEvent(event) {
        if (!this.isConnected || !this.connection) return;
        try {
            this.connection.send({ type: 'game_event', event: event });
        } catch (e) {
            console.warn('[Network] Failed to send game event:', e);
        }
    }

    disconnect() {
        if (this.connection) {
            try {
                this.connection.close();
            } catch (e) {}
            this.connection = null;
        }
        if (this.peer) {
            try {
                this.peer.destroy();
            } catch (e) {}
            this.peer = null;
        }
        this.isConnected = false;
        // Clear session storage
        sessionStorage.removeItem('online_peer_id');
        sessionStorage.removeItem('online_room_code');
        sessionStorage.removeItem('online_is_host');
        sessionStorage.removeItem('online_opponent_peer_id');
    }
}