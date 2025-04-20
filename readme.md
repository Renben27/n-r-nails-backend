 #📚 N&R Nails Backend dokumentáció

 ## Projekt áttekintés
 Az N&R Nails webalkalmazás egy modern és felhasználóbarát platform, amely kifejezetten egy körömszalon igényeire lett szabva. A projekt célja egy olyan online felület létrehozása volt, ahol az ügyfelek könnyedén tudnak időpontot foglalni, kapcsolatba léphetnek a szalon munkatársaival, valamint megoszthatják tapasztalataikat és véleményüket. A véleményírási lehetőség pedig hozzájárul a folyamatos fejlődéshez és a vendégek elégedettségének növeléséhez.

---
## Készítette🎀
- Horváth Renáta
- Pásztór Nóra

---
 ## 📑 Tartalomjegyzék

- [Projekt áttekintés](#projekt-áttekintés)
- [Technológiák](#technológiák)
- [Telepítés](#telepítés)
- [Környezet változók](#környezet-változók)
- [API végpontok](#api-végpontok)
- [Adatbázis séma (DrawSQL)](#adatbázis-séma-drawsql)
- [Postman Tesztelés](#postman-tesztelés)
- [Frontend Link](#frontend-link)
- [Példaképek](#példaképek)
- [Fejlesztői információk](#fejlesztői-információk)

 ---
## 🛠 Technológiák - fejlesztői környezet

- Node.js
- Express.js
- MySQL
- JWT Auth
- dotenv
- Postman (teszteléshez)  

---
 ## ⚙️ Telepítés

```bash
git clone  
npm install
npm run dev
```
---
## Adatbázis
- felhasznalok
  - felhasznalo_id
  - email
  - psw
  - felhasznev
  - nev
  - telefon
  - szerepkor
- foglalasok
  - foglalas_id
  - felhasznalo_id
  - datum
  - szolgaltatas_id
- hozzaszolasok
  - hozzaszolas_id
  - velemenyek_id
  - felhasznalo_id
  - hozzaszolas
  - datum
- kapcsolat
  - kapcsolat_id
  - nev
  - telefon
  - email
  - uzenet
- kategoriak_id
  - kategoria_id
  - nev
  - kep
- munkaink
  - munka_id
  - felhasznalo_id
  - kep
  - ido
- szolgaltatasok
  - szolgaltatas_id
  - kategoria_id
  - nev
  - ar
- velemenyek
  - velemeny_id
  - felhasznalo_id
  - velemeny
  - datum
 
---
## DrawSQL
A programhoz miren valo:.... és a link



