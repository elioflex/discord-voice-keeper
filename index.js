const { Client, VoiceChannel } = require('discord.js-selfbot-v13');
const { 
    joinVoiceChannel,
    entersState,
    VoiceConnectionStatus
} = require('@discordjs/voice');

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
const RECONNECT_INTERVAL = 3000; // 3 seconds

let voiceConnection = null;

// No audio player needed for simple connection

async function joinVoiceChannelWithRetry() {
    while (true) {
        try {
            console.log('Starting connection process...');
            const channel = await client.channels.fetch(VOICE_CHANNEL_ID);
            if (!channel || !(channel instanceof VoiceChannel)) {
                console.error('Invalid voice channel, retrying in 3 seconds...');
                await new Promise(resolve => setTimeout(resolve, RECONNECT_INTERVAL));
                continue;
            }

            console.log(`Connecting to channel: ${channel.name} (${channel.id})`);

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
                
                if (newState.status === VoiceConnectionStatus.Disconnected) {
                    console.log('Disconnected, will try to reconnect...');
                } else if (newState.status === VoiceConnectionStatus.Destroyed) {
                    console.log('Connection destroyed, will create new one...');
                    voiceConnection = null;
                }
            });

            // Handle connection errors
            connection.on('error', error => {
                console.error('Connection error:', error);
            });

            // Wait for connection
            try {
                console.log('Waiting for connection...');
                await entersState(connection, VoiceConnectionStatus.Ready, 30000);
                console.log('Successfully connected to voice channel');
                voiceConnection = connection;
                
                // Keep checking connection status
                while (voiceConnection && voiceConnection.state.status !== VoiceConnectionStatus.Destroyed) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
                
                console.log('Connection lost, will create new one...');
            } catch (error) {
                console.error('Failed to connect:', error);
                console.log(`Will try again in ${RECONNECT_INTERVAL/1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, RECONNECT_INTERVAL));
            }
        } catch (error) {
            console.error('Error:', error);
            console.log(`Will try again in ${RECONNECT_INTERVAL/1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, RECONNECT_INTERVAL));
        }
    }
}

// Keep alive mechanism not needed - handled in the connection loop

// Client events
client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);
    console.log('Starting voice connection loop...');
    joinVoiceChannelWithRetry().catch(console.error);
});

// Error handling
client.on('error', error => {
    console.error('Client error:', error);
});

// Login
client.login(process.env.DISCORD_TOKEN).catch(error => {
    console.error('Login error:', error);
});
