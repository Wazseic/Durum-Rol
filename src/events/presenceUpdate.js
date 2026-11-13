const { Events } = require('discord.js');
const config = require('../utils/config');
const { isle } = require('../utils/durum');

module.exports = {
  name: Events.PresenceUpdate,
  async execute(client, eski, yeni) {
    if (!yeni?.guild || yeni.guild.id !== config.GUILDID) return;
    const member = yeni.member ?? (await yeni.guild.members.fetch(yeni.userId).catch(() => null));
    if (!member) return;
    await isle(yeni.guild, member, yeni);
  },
};
