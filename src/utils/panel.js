const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  RoleSelectMenuBuilder,
  ChannelSelectMenuBuilder,
  StringSelectMenuBuilder,
  ChannelType,
  MessageFlags,
} = require('discord.js');
const db = require('./db');
const config = require('./config');
const { e } = require('./emojis');

const V2 = MessageFlags.IsComponentsV2;
const EPH = MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral;

const txt = (c) => new TextDisplayBuilder().setContent(c);
const sep = () => new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small);
const row = (...c) => new ActionRowBuilder().addComponents(...c);
const btn = (id, label, emoji, style = ButtonStyle.Secondary) =>
  new ButtonBuilder().setCustomId(id).setLabel(label).setEmoji(emoji).setStyle(style);
const kanalYaz = (id) => (id ? `<#${id}>` : '`Ayarlanmadı`');

/** Basit tek mesajlık V2 kutusu */
function kutu(renk, ...satirlar) {
  const c = new ContainerBuilder().setAccentColor(renk);
  satirlar.forEach((s) => c.addTextDisplayComponents(txt(s)));
  return c;
}

const yetkisiz = () => kutu(0xed4245, `${e('hata')} **Bu işlem için yetkin yok.**\n-# Yalnızca \`config.json\` içindeki **yetkiliIDs** kullanabilir.`);

// ───────────────────────── ANA PANEL ─────────────────────────
function anaPanel(guild) {
  const d = db.al();
  const rolObj = d.rolID ? guild.roles.cache.get(d.rolID) : null;
  let uyari = '';
  if (d.rolID && !rolObj) uyari = `\n\n${e('uyari')} Seçili rol bulunamadı, yeniden seç.`;
  else if (rolObj && !rolObj.editable) uyari = `\n\n${e('uyari')} Botun rolü **${rolObj.name}** rolünün altında! Rol sıralamasını düzelt.`;

  const kelimeler = d.kelimeler.length ? d.kelimeler.map((k) => `\`${k}\``).join(' ') : '`Yok`';

  const c = new ContainerBuilder()
    .setAccentColor(d.sistemAktif ? 0x5865f2 : 0xed4245)
    .addTextDisplayComponents(txt(`# ${e('bot')} Durum Rol Paneli\n-# ${e('durum')} ${config.GUILDNAME}`))
    .addSeparatorComponents(sep())
    .addTextDisplayComponents(
      txt(
        [
          `${e('guc')} **Sistem:** ${d.sistemAktif ? '`Aktif`' : '`Kapalı`'}`,
          `${e('kelime')} **İzlenen kelimeler:** ${kelimeler}`,
          `${e('rol')} **Verilecek rol:** ${d.rolID ? `<@&${d.rolID}>` : '`Ayarlanmadı`'}`,
          `${e('bildirim')} **Bildirim kanalı:** ${kanalYaz(d.bildirimKanalID)}`,
          `${e('log')} **Log kanalı:** ${kanalYaz(d.logKanalID)}`,
        ].join('\n') + uyari,
      ),
    )
    .addSeparatorComponents(sep());

  const rolMenu = new RoleSelectMenuBuilder().setCustomId('durum:rol').setPlaceholder('Durum rolünü seç').setMinValues(1).setMaxValues(1);
  if (d.rolID) rolMenu.setDefaultRoles(d.rolID);

  const kanalMenu = (id, yer, secili) => {
    const m = new ChannelSelectMenuBuilder()
      .setCustomId(id)
      .setPlaceholder(yer)
      .setChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
      .setMinValues(1)
      .setMaxValues(1);
    if (secili) m.setDefaultChannels(secili);
    return m;
  };

  c.addActionRowComponents(row(rolMenu))
    .addActionRowComponents(row(kanalMenu('durum:bildirim', 'Bildirim kanalını seç', d.bildirimKanalID)))
    .addActionRowComponents(row(kanalMenu('durum:log', 'Log kanalını seç', d.logKanalID)))
    .addSeparatorComponents(sep())
    .addActionRowComponents(
      row(
        btn('durum:kelimeler', 'Kelimeler', e('kelime'), ButtonStyle.Primary),
        btn('durum:istatistik', 'İstatistik', e('istatistik'), ButtonStyle.Primary),
        btn('durum:toggle', d.sistemAktif ? 'Kapat' : 'Aç', e('guc'), d.sistemAktif ? ButtonStyle.Danger : ButtonStyle.Success),
        btn('durum:yenile', 'Yenile', e('yenile')),
      ),
    );
  return c;
}

// ───────────────────────── KELİME PANELİ ─────────────────────────
function kelimePanel() {
  const d = db.al();
  const liste = d.kelimeler.length ? d.kelimeler.map((k, i) => `**${i + 1}.** \`${k}\``).join('\n') : '_Henüz kelime eklenmedi._';

  const c = new ContainerBuilder()
    .setAccentColor(0xfee75c)
    .addTextDisplayComponents(txt(`# ${e('kelime')} İzlenen Kelimeler\n-# ${e('durum')} Özel durumda bu kelimeler aranır (büyük/küçük harf fark etmez).`))
    .addSeparatorComponents(sep())
    .addTextDisplayComponents(txt(liste))
    .addSeparatorComponents(sep());

  if (d.kelimeler.length) {
    c.addActionRowComponents(
      row(
        new StringSelectMenuBuilder()
          .setCustomId('durum:kelimesil')
          .setPlaceholder('Silinecek kelimeleri seç')
          .setMinValues(1)
          .setMaxValues(Math.min(d.kelimeler.length, 25))
          .addOptions(d.kelimeler.slice(0, 25).map((k) => ({ label: k.slice(0, 100), value: k.slice(0, 100) }))),
      ),
    );
  }
  c.addActionRowComponents(row(btn('durum:kelimeekle', 'Kelime Ekle', e('ekle'), ButtonStyle.Success), btn('durum:ana', 'Geri', e('geri'))));
  return c;
}

// ───────────────────────── İSTATİSTİK PANELİ ─────────────────────────
function istatistikPanel(guild, client) {
  const d = db.al();
  const s = d.istatistik;
  const rol = d.rolID ? guild.roles.cache.get(d.rolID) : null;
  const aktif = rol ? rol.members.size : 0;
  const son = s.sonIslemler.length
    ? s.sonIslemler
        .slice(0, 5)
        .map((x) => `${x.tip === 'al' ? e('onay') : e('hata')} **${x.kullanici}** — ${x.tip === 'al' ? 'Durum Aldı' : 'Durumu Sildi'} • <t:${Math.floor(x.zaman / 1000)}:R>`)
        .join('\n')
    : '_Henüz işlem yok._';
  const uptime = Math.floor(process.uptime());
  const sure = `${Math.floor(uptime / 3600)}sa ${Math.floor((uptime % 3600) / 60)}dk`;

  return new ContainerBuilder()
    .setAccentColor(0x57f287)
    .addTextDisplayComponents(txt(`# ${e('istatistik')} Durum İstatistikleri\n-# ${e('durum')} ${config.GUILDNAME}`))
    .addSeparatorComponents(sep())
    .addTextDisplayComponents(
      txt(
        [
          `${e('rol')} **Şu an rolü olan:** \`${aktif}\``,
          `${e('onay')} **Toplam durum alan:** \`${s.toplamAlinan}\``,
          `${e('hata')} **Toplam durumu silen:** \`${s.toplamSilinen}\``,
          `${e('kupa')} **İzlenen kelime:** \`${d.kelimeler.length}\``,
          `${e('bot')} **Ping:** \`${client.ws.ping}ms\` • **Çalışma:** \`${sure}\``,
        ].join('\n'),
      ),
    )
    .addSeparatorComponents(sep())
    .addTextDisplayComponents(txt(`### ${e('log')} Son İşlemler\n${son}`))
    .addSeparatorComponents(sep())
    .addActionRowComponents(row(btn('durum:istatistik', 'Yenile', e('yenile')), btn('durum:ana', 'Geri', e('geri'))));
}

module.exports = { V2, EPH, txt, sep, kutu, yetkisiz, anaPanel, kelimePanel, istatistikPanel };
