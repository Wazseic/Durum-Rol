const { Events, MessageFlags } = require('discord.js');
const config = require('../utils/config');
const { yetkili } = require('../utils/yetki');
const { yetkisiz } = require('../utils/panel');
const emoji = require('../commands/emoji');

module.exports = {
  name: Events.MessageCreate,
  async execute(client, message) {
    if (message.author.bot || !message.guild || message.guild.id !== config.GUILDID) return;
    const parcalar = message.content.trim().split(/\s+/);
    if (parcalar[0].toLowerCase() !== '.emoji') return;

    if (!yetkili(message.author.id)) {
      return message.reply({ components: [yetkisiz()], flags: MessageFlags.IsComponentsV2, allowedMentions: { repliedUser: false } });
    }
    await emoji.execute(client, message, parcalar.slice(1));
  },
};
