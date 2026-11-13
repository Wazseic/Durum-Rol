const fs = require('fs');
const path = require('path');

const dosya = path.join(__dirname, '..', '..', 'ayarlar.json');

const VARSAYILAN = {
  sistemAktif: true,
  kelimeler: ['.gg/npx', '/npx'],
  rolID: '',
  bildirimKanalID: '',
  logKanalID: '',
  emojiler: {},
  istatistik: { toplamAlinan: 0, toplamSilinen: 0, sonIslemler: [] },
};

let veri;

function yukle() {
  try {
    const okunan = JSON.parse(fs.readFileSync(dosya, 'utf8'));
    veri = { ...structuredClone(VARSAYILAN), ...okunan };
  } catch {
    veri = structuredClone(VARSAYILAN);
  }
  veri.istatistik = { ...VARSAYILAN.istatistik, ...(veri.istatistik || {}) };
  veri.emojiler = veri.emojiler || {};
  kaydet();
}

function kaydet() {
  const gecici = dosya + '.tmp';
  fs.writeFileSync(gecici, JSON.stringify(veri, null, 2));
  fs.renameSync(gecici, dosya);
}

function al() {
  return veri;
}

function kayit(tip, member) {
  const s = veri.istatistik;
  if (tip === 'al') s.toplamAlinan++;
  else s.toplamSilinen++;
  s.sonIslemler.unshift({ tip, kullanici: member.user.username, id: member.id, zaman: Date.now() });
  s.sonIslemler = s.sonIslemler.slice(0, 10);
  kaydet();
}

yukle();

module.exports = { al, kaydet, kayit };
