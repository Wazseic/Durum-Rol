const fs = require('fs');
const path = require('path');

const dosya = path.join(__dirname, '..', '..', 'config.json');

function hataVeCik(mesaj) {
  console.error(`\n❌ ${mesaj}\n`);
  process.exit(1);
}

if (!fs.existsSync(dosya)) hataVeCik('config.json bulunamadı!');

let c;
try {
  c = JSON.parse(fs.readFileSync(dosya, 'utf8'));
} catch (err) {
  hataVeCik(`config.json okunamadı (JSON hatası): ${err.message}`);
}

if (typeof c.TOKEN !== 'string' || c.TOKEN.length < 30) hataVeCik('config.json → TOKEN geçersiz veya yazılmamış.');
if (!/^\d{17,20}$/.test(String(c.CLIENTID))) hataVeCik('config.json → CLIENTID geçersiz (17-20 haneli sayı olmalı).');
if (!/^\d{17,20}$/.test(String(c.GUILDID))) hataVeCik('config.json → GUILDID geçersiz (17-20 haneli sayı olmalı).');

c.GUILDNAME = c.GUILDNAME || 'Sunucu';
c.yetkiliIDs = (c.yetkiliIDs || c.YETKILIIDs || []).map(String);

module.exports = c;
