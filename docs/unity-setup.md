# Unity 3D Mobil Kurulum (Hizli Baslangic)

Bu repo iki parcadan olusur:
- **/unity**: Unity 3D mobil oyun iskeleti ve C# scriptleri
- **/ (root)**: onceki 2D web prototipi (istersen kullanma)

## Gerekenler
- Unity Hub
- Unity 2022.3 LTS (3D URP ile)

## Adimlar (En Basit)
1) Unity Hub ac
2) **New Project** > **3D (URP)** sec
3) Proje adini `Ashfall3D` gibi ver, bir klasor sec
4) Proje acildiktan sonra bu repodaki **/unity/Assets** klasorunu
   kendi Unity projenin **Assets** klasorune kopyala

## Ornek Sahne Kurulumu (Ozet)
1) **Scene**: `Arena` adinda yeni sahne
2) **Player** GameObject:
   - Capsule veya Character model
   - `PlayerController` ve `PlayerCombat` ekle
3) **Camera**:
   - `IsometricCameraFollow` ekle
4) **Managers**:
   - Bos GameObject: `GameBootstrap`
   - `GameBootstrap` scriptini ekle
5) **Enemy Spawn**:
   - `WaveManager` GameObject olustur
   - Prefab listelerini Inspector uzerinden doldur
6) **UI**:
   - Canvas ac
   - `HUDController` ve `VirtualJoystick` icin UI elemanlarini olustur

## Mobil Kontrol
`VirtualJoystick` sol tarafta olusturulmus UI paneline baglanir.
Sag tarafta "Ability" butonu ile yetenek tetiklenir.

## Notlar
- Bu iskelet, temel oynanis ve sistem mimarisi icin hazirdir.
- Unity Editor icinde sahne ve prefablar ayarlanmalidir.
