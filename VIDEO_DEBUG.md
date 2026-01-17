# Video Background Debug Guide

## Video Dosyası Kontrolü

Video dosyasının doğru yerde olduğundan emin olun:

```bash
# Terminal'de kontrol edin:
cd /Users/serhatcali/Desktop/cali-sound
ls -lh public/caliweb.mp4
```

Eğer dosya yoksa:
```bash
cp ~/Downloads/caliweb_slient.mp4 public/caliweb.mp4
```

## Video Görünmüyorsa Kontrol Listesi

1. **Browser Console'u açın (F12)**
   - Video yükleme hatası var mı kontrol edin
   - Network tab'ında `/caliweb.mp4` dosyası yükleniyor mu?

2. **Video dosyası boyutu**
   - Çok büyük dosyalar yavaş yüklenebilir
   - Video optimize edilmiş mi kontrol edin

3. **Browser autoplay policy**
   - Bazı browser'lar autoplay'i engelleyebilir
   - Video muted olmalı (✅ zaten var)

4. **CSS z-index**
   - Video: z-index: 0
   - Overlay'ler: z-index: 1-2
   - Content: z-index: 10

5. **Hard refresh**
   - Cmd+Shift+R (Mac) veya Ctrl+Shift+R (Windows)
   - Browser cache'i temizleyin

## Test Etmek İçin

Browser console'da şunu çalıştırın:
```javascript
const video = document.querySelector('.hero-video-element');
console.log('Video element:', video);
console.log('Video src:', video?.querySelector('source')?.src);
console.log('Video readyState:', video?.readyState);
console.log('Video paused:', video?.paused);
```

Eğer video element bulunamazsa, CSS selector'ı kontrol edin.
