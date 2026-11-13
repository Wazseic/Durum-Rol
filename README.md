<div align="center">

# 🤖 Durum Rol Botu

**Özel durumunda (custom status) belirlediğin kelimeyi yazan üyelere otomatik rol veren, Discord Components V2 destekli modern panel botu.**

![Node](https://img.shields.io/badge/Node.js-%3E%3D18.17-339933?logo=node.js&logoColor=white)
![discord.js](https://img.shields.io/badge/discord.js-v14-5865F2?logo=discord&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)
![dotenv](https://img.shields.io/badge/.env-kullanılmaz-red)

</div>

---

## ✨ Özellikler

- 🔍 **Durum takibi** — Üyelerin özel durumunda izlenen kelimeler aranır (`.gg/npx`, `/npx` gibi). Büyük/küçük harf fark etmez.
- 🎭 **Otomatik rol** — Kelime bulunursa rol verilir, durumdan kaldırılırsa rol geri alınır.
- 🔔 **Bildirim kanalı** — Rol verildiğinde şık bir bildirim gönderilir.
- 📜 **Log kanalı** — Her alma/silme işlemi loglanır.
- 📊 **İstatistik paneli** — Rolü olan kişi sayısı, toplam alan/silen, son işlemler, ping ve çalışma süresi.
- 🧩 **Components V2** — Tamamen yeni nesil, sade ve emojili arayüz.
- 🎨 **Emoji kurulum sistemi** — `.emoji liste` ile eksikleri gör, `.emoji kur` ile harici emojiyi bota ekle.
- 🔐 **Yetki sistemi** — Panel ve komutları yalnızca `config.json` içindeki `yetkiliIDs` kullanabilir.
- 🚫 **`.env` / `dotenv` yok** — Tüm ayarlar `config.json` ve `ayarlar.json` içinde.

---

## 📦 Kurulum

```bash
git clone https://github.com/KULLANICI/durum-rol-botu.git
cd durum-rol-botu
npm i
```

`config.json` dosyasını doldur (aşağıya bak), ardından:

```bash
npm start
```

> Gereksinim: **Node.js 18.17+**

---

## ⚙️ Yapılandırma

### `config.json`

```json
{
  "TOKEN": "BOT_TOKENI",
  "CLIENTID": "BOT_CLIENT_ID",
  "GUILDID": "SUNUCU_ID",
  "GUILDNAME": "Sunucu Adı",
  "yetkiliIDs": ["id1", "id2"]
}
```

| Alan | Açıklama |
| --- | --- |
| `TOKEN` | Bot tokeni (Developer Portal → Bot) |
| `CLIENTID` | Uygulama ID'si |
| `GUILDID` | Botun çalışacağı sunucunun ID'si |
| `GUILDNAME` | Panelde görünecek sunucu adı |
| `yetkiliIDs` | `/durum` ve `.emoji` kullanabilecek kullanıcı ID'leri |

> ⚠️ `config.json` dosyası `.gitignore` içindedir. Token'ını asla GitHub'a yükleme. Şablon için `config.example.json` dosyasına bak.

### `ayarlar.json`

Panelden yapılan ayarlar (kelimeler, rol, kanallar, emojiler, istatistik) burada saklanır. **Elle düzenlemene gerek yok**, panel yönetir.

---

## 🛠️ Discord Developer Portal Ayarları

1. [Developer Portal](https://discord.com/developers/applications) → Uygulaman → **Bot**
2. **Privileged Gateway Intents** bölümünde şunları **aç**:
   - ✅ **Presence Intent**
   - ✅ **Server Members Intent**
   - ✅ **Message Content Intent**
3. Botu şu yetkilerle davet et: `Manage Roles`, `View Channels`, `Send Messages`, `Use Slash Commands` (scope: `bot` + `applications.commands`)
4. Sunucuda **botun rolünü**, verilecek rolün **üstüne** taşı.

---

## 🎮 Kullanım

### `/durum` — Yönetim paneli
Yalnızca yetkililer görür (mesaj sadece sana görünür):

| Bölüm | İşlev |
| --- | --- |
| 🎭 Rol menüsü | Durum alanlara verilecek rol |
| 🔔 Bildirim kanalı | "Rol verildi" bildirimleri |
| 📜 Log kanalı | Alma/silme logları |
| 🔤 Kelimeler | Kelime ekle / sil |
| 📊 İstatistik | Sayılar ve son işlemler |
| 🔌 Aç/Kapat | Sistemi geçici durdurur |

### Log örneği

```
👤 Kullanıcı : Wazseic
📌 Bilgi : Durum Aldı
🕒 Zaman : 14:00 12 Ocak 2026
🆔 ID: 299292929292
```

---

## 🎨 Emoji Sistemi

Bot, hiçbir özel emoji kurulmasa da varsayılan emojilerle çalışır. İstersen kendi emojilerini kurabilirsin:

| Komut | Açıklama |
| --- | --- |
| `.emoji liste` | Eksik ve kurulu emojileri gösterir |
| `.emoji kur <anahtar> <emoji>` | Başka sunucudan alınan emojiyi bota ekler |
| `.emoji kur <anahtar> <resim linki>` | Resim linkinden emoji oluşturur |
| `.emoji sil <anahtar>` | Özel emojiyi kaldırır, varsayılana döner |

**Örnek:**

```
.emoji kur bot <:ornek:123456789012345678>
```

Bot, emojiyi **kendi uygulama emojisi** olarak ekler (sunucu emoji slotu harcamaz) ve bulunduğu her yerde kullanabilir.

**Anahtarlar:** `bot` `avatar` `link` `kullanici` `id` `zaman` `bilgi` `durum` `rol` `kanal` `bildirim` `log` `istatistik` `kupa` `kelime` `guc` `ayar` `ekle` `sil` `yenile` `geri` `onay` `hata` `uyari`

> 💡 Başka sunucudaki emojinin yazılı halini almak için mesaj kutusuna `\:emojiadi:` yazıp gönder; `<:isim:id>` şeklinde çıktıyı kopyala.

---

## 📁 Proje Yapısı

```
durum-rol-botu/
├── config.json          # Token ve temel ayarlar
├── ayarlar.json         # Panelden yönetilen ayarlar
├── package.json
├── LICENSE
└── src/
    ├── index.js
    ├── commands/        # /durum, .emoji
    ├── events/          # ready, presenceUpdate, interactionCreate, messageCreate
    └── utils/           # config, db, emojis, panel (Components V2), durum
```

---

## ❓ SSS

**Çevrimdışı kullanıcılar rolünü kaybeder mi?**
Hayır. Discord çevrimdışı kullanıcıların durumunu göndermediği için bu kullanıcılar atlanır; rol, kullanıcı çevrimiçi olup durumu değiştirdiğinde güncellenir.

**Rol verilmiyor?**
Botun rolünün verilecek rolün üstünde olduğundan ve **Manage Roles** yetkisi olduğundan emin ol. Panel de bu durumda uyarı gösterir.

**Botu birden fazla sunucuda kullanabilir miyim?**
Bu sürüm tek sunucu (`GUILDID`) için tasarlandı.

---

## 🤝 Katkı

Pull request ve issue'lara açığız. Fork'la, değiştir, PR gönder.

## 📄 Lisans

[MIT](LICENSE) © 2026 Durum Rol Botu
