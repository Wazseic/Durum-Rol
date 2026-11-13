const {
  ActivityType,
  ContainerBuilder,
  SectionBuilder,
  ThumbnailBuilder,
  MessageFlags,
} = require('discord.js');
const db = require('./db');
const { e } = require('./emojis');
const { txt, sep } = require('./panel');

const kilit = new Set();

function zamanYaz(d = new Date()) {
  const p = new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    hour: '2-digit',
    minute: '2-digit',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(d);
  const g = (t) => p.find((x) => x.type === t).value;
  return `${g('hour')}:${g('minute')} ${g('day')} ${g('month')} ${g('year')}`;
}

function durumMetni(activities) {
  const a = activities?.find((x) => x.type === ActivityType.Custom);
  return a?.state || '';
}

function eslesen(metin) {
  const m = metin.toLowerCase();
  return db.al().kelimeler.find((k) => m.includes(k.toLowerCase()));
}

async function kanalaGonder(guild, kanalId, container) {
  if (!kanalId) return;
  const kanal = guild.channels.cache.get(kanalId);
  if (!kanal?.isTextBased()) return;
  await kanal
    .send({ components: [container], flags: MessageFlags.IsComponentsV2, allowedMentions: { parse: [] } })
    .catch((err) => console.error(`[Kanal] Mesaj gönderilemedi (${kanalId}): ${err.message}`));
}

function logKutusu(member, bilgi, alindi) {
  return new ContainerBuilder()
    .setAccentColor(alindi ? 0x57f287 : 0xed4245)
    .addTextDisplayComponents(
      txt(
        [
          `${e('kullanici')} **Kullanıcı :** ${member.user.username}`,
          `${e('bilgi')} **Bilgi :** ${bilgi}`,
          `${e('zaman')} **Zaman :** ${zamanYaz()}`,
          `${e('id')} **ID:** ${member.id}`,
        ].join('\n'),
      ),
    );
}

function bildirimKutusu(member, kelime, rolId) {
  return new ContainerBuilder()
    .setAccentColor(0x5865f2)
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          txt(`## ${e('onay')} Durum Rolü Verildi!`),
          txt(
            `${e('kullanici')} <@${member.id}> durumuna ${e('kelime')} \`${kelime}\` ekledi.\n${e('rol')} <@&${rolId}> rolü verildi. ${e('kupa')}`,
          ),
        )
        .setThumbnailAccessory(new ThumbnailBuilder().setURL(member.displayAvatarURL({ size: 256 }))),
    );
}

/** Tek bir üyenin durumunu kontrol eder, gerekirse rolü verir/alır. */
async function isle(guild, member, presence) {
  const d = db.al();
  if (!d.sistemAktif || !d.rolID || member.user.bot) return;
  // Çevrimdışı kullanıcının durumu görünmez; rolü yanlışlıkla almamak için atla.
  if (!presence || presence.status === 'offline') return;

  const rol = guild.roles.cache.get(d.rolID);
  if (!rol || !rol.editable) return;

  if (kilit.has(member.id)) return;
  kilit.add(member.id);
  try {
    const bulunan = eslesen(durumMetni(presence.activities));
    const sahip = member.roles.cache.has(rol.id);

    if (bulunan && !sahip) {
      await member.roles.add(rol, `Durumda "${bulunan}" bulundu`);
      db.kayit('al', member);
      await kanalaGonder(guild, d.bildirimKanalID, bildirimKutusu(member, bulunan, rol.id));
      await kanalaGonder(guild, d.logKanalID, logKutusu(member, 'Durum Aldı', true));
    } else if (!bulunan && sahip) {
      await member.roles.remove(rol, 'Durumdan kelime kaldırıldı');
      db.kayit('sil', member);
      await kanalaGonder(guild, d.logKanalID, logKutusu(member, 'Durumu Sildi', false));
    }
  } catch (err) {
    console.error(`[Durum] ${member.user.tag} işlenemedi: ${err.message}`);
  } finally {
    kilit.delete(member.id);
  }
}

/** Bot açılırken tüm üyeleri tarar. */
async function tumunuTara(guild) {
  const uyeler = await guild.members.fetch({ withPresences: true });
  for (const m of uyeler.values()) await isle(guild, m, m.presence);
}

module.exports = { isle, tumunuTara, zamanYaz };
