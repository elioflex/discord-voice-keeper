const { Client, VoiceChannel } = require('discord.js-selfbot-v13');
const { 
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    entersState,
    VoiceConnectionStatus,
    AudioPlayerStatus,
    NoSubscriberBehavior,
    StreamType
} = require('@discordjs/voice');
const debug = require('debug')('voice:main');
const debugConnection = debug.extend('connection');
const debugState = debug.extend('state');
const debugError = debug.extend('error');

// Load environment variables
require('dotenv').config();

// Create a new client instance with minimal options
const client = new Client({
    checkUpdate: false,
    patchVoice: true,
    captureRejections: true
});

// Configuration
const VOICE_CHANNEL_ID = process.env.VOICE_CHANNEL_ID;
const KEEP_ALIVE_INTERVAL = parseInt(process.env.KEEP_ALIVE_INTERVAL) || 15000;
const MAX_RECONNECT_ATTEMPTS = parseInt(process.env.MAX_RECONNECT_ATTEMPTS) || 999999;
const RECONNECT_INTERVAL = parseInt(process.env.RECONNECT_INTERVAL) || 3000;

let voiceConnection = null;
let audioPlayer = null;
let reconnectAttempts = 0;
let lastActivityTime = Date.now();

// Voice state
let currentVoiceState = {
    muted: false,
    deafened: false,
    volume: 1.0
};

function setupAudioPlayer() {
    audioPlayer = createAudioPlayer({
        behaviors: {
            noSubscriber: NoSubscriberBehavior.Play
        }
    });

    audioPlayer.on('error', error => {
        debugError('Audio player error: %O', error);
    });

    return audioPlayer;
}

async function joinVoiceChannelWithRetry() {
    while (true) {
        try {
            console.log('Starting connection process...');
            const channel = await client.channels.fetch(VOICE_CHANNEL_ID);
            if (!channel || !(channel instanceof VoiceChannel)) {
                console.error('Invalid voice channel, retrying in 3 seconds...');
                await new Promise(resolve => setTimeout(resolve, 3000));
                continue;
            }

            console.log('Channel info:', {
                name: channel.name,
                id: channel.id,
                guildId: channel.guild.id,
                members: channel.members.size
            });

            // Clean up any existing connection
            if (voiceConnection) {
                console.log('Cleaning up existing connection...');
                try {
                    voiceConnection.destroy();
                } catch (error) {
                    console.error('Error cleaning up:', error);
                }
                voiceConnection = null;
            }

            // Create a new connection with minimal options
            console.log('Creating voice connection...');
            const connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator,
                selfDeaf: false,
                selfMute: false
            });

            // Set up state change handler
            connection.on('stateChange', (_, newState) => {
                console.log('Connection state:', newState.status);
                
                if (newState.status === VoiceConnectionStatus.Ready) {
                    console.log('Connection is ready');
                    voiceConnection = connection;
                    lastActivityTime = Date.now();
                } else if (newState.status === VoiceConnectionStatus.Disconnected) {
                    console.log('Disconnected, will try to reconnect...');
                    // Don't destroy, let it try to reconnect
                } else if (newState.status === VoiceConnectionStatus.Destroyed) {
                    console.log('Connection destroyed, will create new one...');
                    voiceConnection = null;
                }
            });

            // Handle connection errors
            connection.on('error', error => {
                console.error('Connection error:', error);
                // Don't destroy, just log the error
            });

            // Wait for connection
            try {
                console.log('Waiting for connection...');
                await entersState(connection, VoiceConnectionStatus.Ready, 30000);
                console.log('Successfully connected');
                // Keep the connection object
                voiceConnection = connection;
            } catch (error) {
                console.error('Failed to connect:', error);
                // Don't destroy, just try again
                console.log('Will try again in 3 seconds...');
                await new Promise(resolve => setTimeout(resolve, 3000));
                continue;
            }

            // Keep checking connection status
            while (true) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                if (!voiceConnection || voiceConnection.state.status === VoiceConnectionStatus.Destroyed) {
                    console.log('Connection lost, will create new one...');
                    break;
                }
            }
        } catch (error) {
            console.error('Error:', error);
            console.log('Will try again in 3 seconds...');
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }
}

// Keep alive mechanism
function keepAlive() {
    if (!client.isReady()) {
        debugError('Client is not ready');
        return;
    }

    if (!voiceConnection) {
        debug('No voice connection, attempting to join...');
        // joinVoiceChannelWithRetry();
        return;
    }

    const status = voiceConnection.state.status;
    debug('Connection status: %s', status);

    if (status === VoiceConnectionStatus.Ready) {
        lastActivityTime = Date.now();
    } else if (status === VoiceConnectionStatus.Disconnected || 
               status === VoiceConnectionStatus.Destroyed) {
        debug('Connection is not ready, destroying and reconnecting...');
        try {
            voiceConnection.destroy();
        } catch (error) {
            debugError('Error destroying connection: %O', error);
        }
        voiceConnection = null;
        // joinVoiceChannelWithRetry();
    }
}

// Client events
client.on('ready', async () => {
    console.log('Logged in as', client.user.tag);
    
    try {
        // Set status
        await client.user.setActivity('Voice Channel', { type: 'LISTENING' });
        console.log('Status set successfully');
        
        // Setup audio
        setupAudioPlayer();
        
        // Start connection loop
        console.log('Starting connection loop...');
        joinVoiceChannelWithRetry().catch(console.error);
    } catch (error) {
        console.error('Error in ready event:', error);
    }
});

// Error handling
client.on('error', error => {
    debugError('Client error: %O', error);
});

// Login
client.login(process.env.DISCORD_TOKEN).catch(error => {
    debugError('Login error: %O', error);
});
