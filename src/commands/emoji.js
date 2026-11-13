// .emoji komutu (prefix) — messageCreate olayından çağrılır.
const { MessageFlags } = require('discord.js');
const db = require('../utils/db');
const { LISTE, eksikler, kurulular } = require('../utils/emojis');
const { e } = require('../utils/emojis');
const { kutu } = require('../utils/panel');

const gonder = (message, container) =>
  message.reply({ components: [container], flags: MessageFlags.IsComponentsV2, allowedMentions: { repliedUser: false, parse: [] } });

function yardim() {
  return kutu(
    0x5865f2,
    `# ${e('bot')} Emoji Sistemi`,
    [
      `${e('log')} \`.emoji liste\` → eksik/kurulu emojileri gösterir`,
      `${e('ekle')} \`.emoji kur <anahtar> <emoji>\` → harici emojiyi bota ekler`,
      `${e('link')} \`.emoji kur <anahtar> <resim linki>\` → linkten emoji yapar`,
      `${e('sil')} \`.emoji sil <anahtar>\` → özel emojiyi kaldırır (varsayılana döner)`,
      '',
      '**Örnek:**',
      '`.emoji kur bot <:ornek:123456789012345678>`',
    ].join('\n'),
  );
}

function liste() {
  const eks = eksikler();
  const kur = kurulular();
  const eksSatir = eks.length ? eks.map((k) => `${LISTE[k][0]} \`${k}\` — ${LISTE[k][1]}`).join('\n') : `${e('onay')} Eksik emoji yok!`;
  const kurSatir = kur.length ? kur.map((k) => `${db.al().emojiler[k]} \`${k}\``).join(' • ') : '_Henüz özel emoji kurulmadı._';
  return kutu(
    eks.length ? 0xfee75c : 0x57f287,
    `# ${e('log')} Emoji Listesi\n-# ${kur.length}/${Object.keys(LISTE).length} özel emoji kurulu`,
    `### ${e('uyari')} Eksik Emojiler (${eks.length})\n${eksSatir}`,
    `### ${e('onay')} Kurulu Emojiler (${kur.length})\n${kurSatir}`,
    '-# Kurmak için: `.emoji kur <anahtar> <emoji>`',
  );
}

async function kur(client, message, args) {
  const anahtar = args[0]?.toLowerCase();
  const kaynak = args[1] || message.attachments.first()?.url;

  if (!anahtar || !LISTE[anahtar]) {
    return gonder(message, kutu(0xed4245, `${e('hata')} Geçersiz anahtar. \`.emoji liste\` ile eksikleri gör.`));
  }
  if (!kaynak) {
    return gonder(message, kutu(0xed4245, `${e('hata')} Emoji, resim linki veya ek dosya belirtmelisin.\n-# Örnek: \`.emoji kur ${anahtar} <:ornek:123456789012345678>\``));
  }

  let url;
  const em = kaynak.match(/^<(a?):\w+:(\d+)>$/);
  if (em) url = `https://cdn.discordapp.com/emojis/${em[2]}.${em[1] ? 'gif' : 'png'}?size=128`;
  else if (/^https?:\/\//i.test(kaynak)) url = kaynak;
  else return gonder(message, kutu(0xed4245, `${e('hata')} Geçerli bir özel emoji (\`<:isim:id>\`) veya resim linki gir.`));

  try {
    const isim = `dr_${anahtar}`;
    await client.application.emojis.fetch();
    const eski = client.application.emojis.cache.find((x) => x.name === isim);
    if (eski) await eski.delete();

    const yeni = await client.application.emojis.create({ attachment: url, name: isim });
    db.al().emojiler[anahtar] = yeni.toString();
    db.kaydet();

    return gonder(message, kutu(0x57f287, `${e('onay')} **${anahtar}** emojisi kuruldu → ${yeni.toString()}`));
  } catch (err) {
    return gonder(message, kutu(0xed4245, `${e('hata')} Emoji eklenemedi: \`${err.message}\``));
  }
}

async function sil(client, message, args) {
  const anahtar = args[0]?.toLowerCase();
  if (!anahtar || !LISTE[anahtar]) return gonder(message, kutu(0xed4245, `${e('hata')} Geçersiz anahtar.`));
  if (!db.al().emojiler[anahtar]) return gonder(message, kutu(0xfee75c, `${e('uyari')} **${anahtar}** için kurulu özel emoji yok.`));

  try {
    await client.application.emojis.fetch();
    const eski = client.application.emojis.cache.find((x) => x.name === `dr_${anahtar}`);
    if (eski) await eski.delete();
  } catch {}
  delete db.al().emojiler[anahtar];
  db.kaydet();
  return gonder(message, kutu(0x57f287, `${e('onay')} **${anahtar}** özel emojisi kaldırıldı, varsayılan emoji kullanılacak.`));
}

module.exports = {
  async execute(client, message, args) {
    const alt = args[0]?.toLowerCase();
    if (alt === 'liste') return gonder(message, liste());
    if (alt === 'kur') return kur(client, message, args.slice(1));
    if (alt === 'sil') return sil(client, message, args.slice(1));
    return gonder(message, yardim());
  },
};
