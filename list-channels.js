require('dotenv').config();
const { Client, VoiceChannel } = require('discord.js-selfbot-v13');

const client = new Client({
    checkUpdate: false,
});

client.on('ready', async () => {
    console.log(`\nLogged in as ${client.user.tag}\n`);
    
    // Get all guilds (servers)
    client.guilds.cache.forEach(guild => {
        console.log(`\n=== Server: ${guild.name} ===`);
        
        // Get all voice channels
        const voiceChannels = guild.channels.cache.filter(channel => channel instanceof VoiceChannel);
        
        if (voiceChannels.size === 0) {
            console.log('No voice channels found');
            return;
        }

        console.log('\nVoice Channels:');
        voiceChannels.forEach(channel => {
            const memberCount = channel.members.size;
            const memberList = channel.members.map(member => member.user.tag).join(', ');
            
            console.log(`\n- ${channel.name}`);
            console.log(`  ID: ${channel.id}`);
            console.log(`  Members (${memberCount}): ${memberCount > 0 ? memberList : 'None'}`);
            console.log(`  User Limit: ${channel.userLimit || 'Unlimited'}`);
            console.log(`  Bitrate: ${channel.bitrate / 1000}kbps`);
        });
    });

    // Exit after listing
    process.exit(0);
});

// Error handling
client.on('error', error => {
    console.error('Client error:', error);
    process.exit(1);
});

// Login
client.login(process.env.DISCORD_TOKEN).catch(error => {
    console.error('Login error:', error);
    process.exit(1);
});
