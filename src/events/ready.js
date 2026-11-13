const { Events, REST, Routes } = require('discord.js');
const config = require('../utils/config');
const { tumunuTara } = require('../utils/durum');
const komutlar = [require('../commands/durum').data.toJSON()];

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`✅ ${client.user.tag} olarak giriş yapıldı.`);

    try {
      const rest = new REST({ version: '10' }).setToken(config.TOKEN);
      await rest.put(Routes.applicationGuildCommands(config.CLIENTID, config.GUILDID), { body: komutlar });
      console.log('✅ Slash komutları yüklendi.');
    } catch (err) {
      console.error('❌ Slash komutları yüklenemedi:', err.message);
    }

    const guild = client.guilds.cache.get(config.GUILDID);
    if (!guild) return console.error('❌ Bot, config.json içindeki GUILDID sunucusunda değil!');

    try {
      await tumunuTara(guild);
      console.log('✅ Mevcut üyelerin durumları tarandı.');
    } catch (err) {
      console.error('❌ Üye taraması başarısız:', err.message);
    }
  },
};
