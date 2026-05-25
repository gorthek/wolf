require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { testConnection } = require('./utils/db');
const voiceStateUpdate = require('./events/voiceStateUpdate');
const messageCreate = require('./events/messageCreate');
const weeklyReport = require('./cron/weeklyReport');
const apiServer = require('./api/server');

// Intents nécessaires pour le tracking vocal et les messages
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once('ready', async () => {
  console.log(`✅ Bot connecté en tant que ${client.user.tag}`);

  // Vérification de la connexion MySQL
  await testConnection();

  // Démarrage du cron hebdomadaire
  weeklyReport.start(client);

  // Démarrage de l'API REST
  apiServer.start();

  console.log(`🚀 Bot Wolf opérationnel`);
});

// Enregistrement des événements
client.on('voiceStateUpdate', (oldState, newState) =>
  voiceStateUpdate(oldState, newState)
);

client.on('messageCreate', (message) =>
  messageCreate(message, client)
);

client.login(process.env.DISCORD_TOKEN);
