# FIGYELEM! Az rtlmost-downloader fejlesztése nem folytatódik! Helyette használjátok a youtube-dl programot.

# rtlmost-downloader [![npm (scoped)](https://img.shields.io/npm/v/rtlmost-downloader.svg)](https://www.npmjs.com/package/rtlmost-downloader) 
A videók letöltését teszi lehetővé a megújult rtlmost.hu oldalról, regisztráció és bejelentkezés nélkül.
![rtlmost-downloader](https://user-images.githubusercontent.com/14183614/46839788-eb01a000-cdbf-11e8-834b-649eff7da58d.gif)

## Indítás parancssori dialógussal

### Gyors használat
```sh
npx rtlmost-downloader
```

### Telepítés parancsként
```sh
npm install -g rtlmost-downloader

rtlmost-downloader
```

## Indítás parancssori paraméterekkel
```sh
# telepítve
rtlmost-downloader --url <rtlmost link> --output <fájl név vagy útvonal>

# vagy forrásból
npm start -- --url <rtlmost link> --output <fájl név vagy útvonal>
```

# Node.js
A futtató környezet a különböző operációs rendszerekhez innen tölthető le: https://nodejs.org/en/download/  
Telepítés után elérhetővé válnak az `npm` és `npx` parancsok.
