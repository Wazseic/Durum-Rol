const {
  Events,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require('discord.js');
const db = require('../utils/db');
const { yetkili } = require('../utils/yetki');
const { anaPanel, kelimePanel, istatistikPanel, yetkisiz, EPH } = require('../utils/panel');
const durumKomutu = require('../commands/durum');

module.exports = {
  name: Events.InteractionCreate,
  async execute(client, i) {
    try {
      if (i.isChatInputCommand()) {
        if (i.commandName === 'durum') return await durumKomutu.execute(client, i);
        return;
      }

      if (!i.customId?.startsWith('durum:')) return;
      if (!yetkili(i.user.id)) return await i.reply({ components: [yetkisiz()], flags: EPH });

      const d = db.al();
      const id = i.customId.split(':')[1];

      // Seçim menüleri
      if (i.isRoleSelectMenu() && id === 'rol') {
        d.rolID = i.values[0];
        db.kaydet();
        return await i.update({ components: [anaPanel(i.guild)] });
      }
      if (i.isChannelSelectMenu() && (id === 'bildirim' || id === 'log')) {
        d[id === 'bildirim' ? 'bildirimKanalID' : 'logKanalID'] = i.values[0];
        db.kaydet();
        return await i.update({ components: [anaPanel(i.guild)] });
      }
      if (i.isStringSelectMenu() && id === 'kelimesil') {
        d.kelimeler = d.kelimeler.filter((k) => !i.values.includes(k.slice(0, 100)));
        db.kaydet();
        return await i.update({ components: [kelimePanel()] });
      }

      // Butonlar
      if (i.isButton()) {
        switch (id) {
          case 'ana':
          case 'yenile':
            return await i.update({ components: [anaPanel(i.guild)] });
          case 'kelimeler':
            return await i.update({ components: [kelimePanel()] });
          case 'istatistik':
            return await i.update({ components: [istatistikPanel(i.guild, client)] });
          case 'toggle':
            d.sistemAktif = !d.sistemAktif;
            db.kaydet();
            return await i.update({ components: [anaPanel(i.guild)] });
          case 'kelimeekle': {
            const modal = new ModalBuilder().setCustomId('durum:modal').setTitle('Kelime Ekle');
            modal.addComponents(
              new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                  .setCustomId('kelime')
                  .setLabel('Kelime(ler) — virgül veya alt satırla ayır')
                  .setPlaceholder('.gg/npx, /npx')
                  .setStyle(TextInputStyle.Paragraph)
                  .setRequired(true)
                  .setMaxLength(300),
              ),
            );
            return await i.showModal(modal);
          }
        }
        return;
      }

      // Modal
      if (i.isModalSubmit() && id === 'modal') {
        const yeni = i.fields
          .getTextInputValue('kelime')
          .split(/[,\n]/)
          .map((k) => k.trim())
          .filter(Boolean);
        for (const k of yeni) {
          if (!d.kelimeler.some((x) => x.toLowerCase() === k.toLowerCase())) d.kelimeler.push(k.slice(0, 100));
        }
        db.kaydet();
        const payload = { components: [kelimePanel()] };
        return i.isFromMessage() ? await i.update(payload) : await i.reply({ ...payload, flags: EPH });
      }
    } catch (err) {
      console.error('[Etkileşim hatası]', err);
    }
  },
};
