const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits } = require('discord.js');
const config = require('./utils/config');
require('./utils/db');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers, // privileged
    GatewayIntentBits.GuildPresences, // privileged
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, // privileged (.emoji komutu için)
  ],
});

// Olayları yükle
const olayKlasoru = path.join(__dirname, 'events');
for (const dosya of fs.readdirSync(olayKlasoru).filter((f) => f.endsWith('.js'))) {
  const olay = require(path.join(olayKlasoru, dosya));
  const calistir = (...args) => olay.execute(client, ...args);
  if (olay.once) client.once(olay.name, calistir);
  else client.on(olay.name, calistir);
}

process.on('unhandledRejection', (err) => console.error('[unhandledRejection]', err));
process.on('uncaughtException', (err) => console.error('[uncaughtException]', err));

client.login(config.TOKEN).catch((err) => {
  console.error(`❌ Giriş başarısız: ${err.message}`);
  process.exit(1);
});
