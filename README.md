# Impostor Kelime Oyunu (Mobil PWA)

Mobil-oncelikli, tek elle oynanabilen Impostor Kelime Oyunu icin tek sayfa PWA
arayuzu. Giris, oda olusturma/katilma, gizli kelime, ipucu turu, tartisma,
oylama ve sonuc ekranlarini hizli bir akista gosterir. Servis calisani ve
manifest dosyasi ile "Ana Ekrana Ekle" deneyimi desteklenir.

## Calistirma

### Lokal
```bash
npm install
npm start
```

Sonra tarayicida:
```
http://localhost:3000
```

### Multiplayer notu
Gercek oyuncularin ayni oda uzerinden oynamasi icin WebSocket sunucusu gerekir.
Bu proje `server.js` ile sunucu + statik dosya servis eder. GitHub Pages
statik oldugu icin multiplayer icin Render/Railway gibi bir ortama deploy
edilmelidir.