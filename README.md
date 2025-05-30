# Discord Voice Keeper

A Node.js application that keeps a Discord user connected to a voice channel for extended periods.

## Installation Guide for Windows

### Prerequisites

1. **Install Node.js**
   - Download the LTS version from [Node.js official website](https://nodejs.org/)
   - Run the installer and follow the installation wizard
   - Make sure to check the option to install necessary tools and add Node.js to your PATH
   - Verify installation by opening Command Prompt and typing:
     ```cmd
     node --version
     npm --version
     ```

2. **Install Git (Optional but recommended)**
   - Download from [Git for Windows](https://gitforwindows.org/)
   - Follow the installation wizard with default options
   - Verify installation:
     ```cmd
     git --version
     ```

### Setting Up the Project

1. **Clone or Download the Repository**
   - Using Git:
     ```cmd
     git clone https://github.com/elioflex/discord-voice-keeper.git
     cd discord-voice-keeper
     ```
   - Without Git: Download the ZIP file from GitHub, extract it, and open Command Prompt in that folder

2. **Install Dependencies**
   - Open Command Prompt in the project directory and run:
     ```cmd
     npm install
     ```
   - This may take a few minutes to complete

3. **Configure Environment Variables**
   - Copy the `.env.template` file and rename it to `.env`
   - Open the `.env` file with Notepad or any text editor
   - Replace the placeholder values with your actual information:
     ```
     DISCORD_TOKEN=your_discord_token_here
     VOICE_CHANNEL_ID=your_voice_channel_id_here
     ```
   - Save the file

### Getting Your Discord Token

**IMPORTANT: Keep your token private and secure at all times. Never share it with anyone or paste it in chat windows. If you accidentally expose your token, reset it immediately by changing your Discord password.**

#### Method 1: Using Browser Console (Safest - Copies to Clipboard)

1. Open Discord in your web browser (Safari, Chrome, Firefox, etc.)
2. Log in to your Discord account
3. Press F12 or Right-click > Inspect to open Developer Tools
4. Go to the Console tab
5. Paste the following code and press Enter:
   ```javascript
   window.webpackChunkdiscord_app.push([[Math.random()], {}, (req) => {for (const m of Object.keys(req.c).map((x) => req.c[x].exports).filter((x) => x)) {if (m.default && m.default.getToken !== undefined) {navigator.clipboard.writeText(m.default.getToken()); console.log('Token copied to clipboard!')}}}]);
   ```
6. Your token will be copied to your clipboard (you'll see "Token copied to clipboard!" in the console)
7. Paste it directly into your `.env` file

#### Method 2: Using Network Tab

1. Open Discord in your web browser
2. Press F12 to open Developer Tools
3. Go to the Network tab
4. Type "api" in the filter box
5. Refresh the page (F5)
6. Look for a request to "api/v9/users/@me"
7. Click on that request and find the "Authorization" header under the "Headers" tab
8. The value of that header is your token

## Getting Voice Channel ID

You have two options to get the voice channel ID:

### Option 1: Using Discord Developer Mode
1. Open Discord
2. Go to User Settings (gear icon)
3. Go to App Settings → Advanced
4. Enable "Developer Mode"
5. Right-click on any voice channel
6. Click "Copy ID" at the bottom of the menu

### Option 2: Using the List Channels Script
1. Make sure your token is in the `.env` file
2. Run the helper script:
   ```bash
   node list-channels.js
   ```
3. The script will show all servers and their voice channels with IDs

## Running the Application

1. **Start the Application**
   - Open Command Prompt in the project directory
   - Run the standard version:
     ```cmd
     npm start
     ```
   - Or run with debug logs enabled:
     ```cmd
     npm run debug
     ```

2. **Running in the Background (Optional)**
   - Install PM2 for process management:
     ```cmd
     npm install -g pm2
     ```
   - Start with PM2:
     ```cmd
     pm2 start index.js --name "discord-voice"
     ```
   - View logs:
     ```cmd
     pm2 logs discord-voice
     ```
   - Stop the application:
     ```cmd
     pm2 stop discord-voice
     ```

## Troubleshooting (Windows-specific)

1. **Node.js Installation Issues**
   - If you encounter "'node' is not recognized as an internal or external command", restart your computer or manually add Node.js to your PATH

2. **Permission Errors**
   - Run Command Prompt as Administrator if you encounter permission issues

3. **Dependency Installation Failures**
   - Ensure you have a stable internet connection
   - Try running: `npm cache clean --force` then `npm install` again
   - If you encounter issues with native modules, install the Windows Build Tools:
     ```cmd
     npm install --global --production windows-build-tools
     ```

4. **Connection Issues**
   - Check your firewall settings
   - Verify your Discord token is correct and not expired
   - Ensure the voice channel ID exists and is accessible to your account

## Features

- Automatically joins specified voice channel
- Maintains connection with keep-alive mechanism
- Auto-reconnects if disconnected
- Error handling and logging
- Configurable connection parameters

## Important Notes

- This application uses a user token which is against Discord's Terms of Service
- **Educational Purpose Only**: This tool is shared for educational purposes to demonstrate Discord API interactions
- **Use at your own risk**: Your Discord account could be suspended or terminated
- **Security Warning**: Keep your token private and secure at all times
- Never commit your `.env` file to version control
- Do not use this on accounts you cannot afford to lose

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
