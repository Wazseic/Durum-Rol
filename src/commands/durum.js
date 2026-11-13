const { SlashCommandBuilder } = require('discord.js');
const { yetkili } = require('../utils/yetki');
const { anaPanel, yetkisiz, EPH } = require('../utils/panel');

module.exports = {
  data: new SlashCommandBuilder().setName('durum').setDescription('Durum rol sistemi yönetim panelini açar.'),

  async execute(client, interaction) {
    if (!yetkili(interaction.user.id)) {
      return interaction.reply({ components: [yetkisiz()], flags: EPH });
    }
    return interaction.reply({ components: [anaPanel(interaction.guild)], flags: EPH });
  },
};
