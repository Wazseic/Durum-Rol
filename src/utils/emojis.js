const db = require('./db');

// anahtar: [varsayılan (unicode), açıklama]
const LISTE = {
  bot: ['🤖', 'Bot / panel başlığı'],
  avatar: ['🖼️', 'Avatar'],
  link: ['🔗', 'Bağlantı'],
  kullanici: ['👤', 'Kullanıcı'],
  id: ['🆔', 'ID'],
  zaman: ['🕒', 'Zaman'],
  bilgi: ['📌', 'Bilgi'],
  durum: ['💬', 'Durum'],
  rol: ['🎭', 'Rol'],
  kanal: ['📢', 'Kanal'],
  bildirim: ['🔔', 'Bildirim'],
  log: ['📜', 'Log'],
  istatistik: ['📊', 'İstatistik'],
  kupa: ['🏆', 'Toplam / başarı'],
  kelime: ['🔤', 'Kelime'],
  guc: ['🔌', 'Sistem aç/kapat'],
  ayar: ['⚙️', 'Ayarlar'],
  ekle: ['➕', 'Ekle'],
  sil: ['🗑️', 'Sil'],
  yenile: ['🔄', 'Yenile'],
  geri: ['◀️', 'Geri'],
  onay: ['✅', 'Başarılı'],
  hata: ['❌', 'Hata'],
  uyari: ['⚠️', 'Uyarı'],
};

/** Kurulu özel emoji varsa onu, yoksa varsayılan unicode emojiyi döndürür. */
function e(anahtar) {
  return db.al().emojiler[anahtar] || LISTE[anahtar]?.[0] || '▫️';
}

function eksikler() {
  const kurulu = db.al().emojiler;
  return Object.keys(LISTE).filter((k) => !kurulu[k]);
}

function kurulular() {
  const kurulu = db.al().emojiler;
  return Object.keys(LISTE).filter((k) => kurulu[k]);
}

module.exports = { LISTE, e, eksikler, kurulular };
