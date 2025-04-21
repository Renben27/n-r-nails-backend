 # 📚 N&R Nails Backend dokumentáció

 ## [Projekt áttekintés](#projekt-áttekintés)
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
## Használt csomagok
- express
- mysql2
- bcryptjs
- dotenv
- jsonwebtoken
- multer
- fs
- path
- validator
- cors
- cookie-parser
 ---
 ## ⚙️ Telepítés

```bash
git clone  https://github.com/Renben27/n-r-nails-backend.git
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
## 🧩 Adatbázis séma (DrawSQL) 
- [👉 Nézd meg a DrawSQL diagramot itt](https://drawsql.app/teams/hungarybaross/diagrams/nrnailsv)
- Vagy akár itt is! ![image](https://github.com/user-attachments/assets/0df3c6c4-9fe7-4ac3-9686-c39ba324c559)

 ---
## 🌐 Frontend Link
A backendhez tartozó frontend itt érhető el: 🔗 Frontend alkalmazás

 ---

 ## 📡  [API végpontok](#api-végpontok)

Az alábbi táblázatban találhatók az API végpontok és azok leírása. Minden végponthoz tartozik a HTTP metódus, az útvonal, valamint a leírás, hogy mi történik a hívás során.

| Módszer | Útvonal         | Leírás                                   | Paraméterek                       | Hitelesítés |
|---------|-----------------|------------------------------------------|------------------------------------|-------------|
| **GET** | /api/getProfile      | Adatok betöltése                       | - | ✅ Igen     |
| **POST**| /api/upload      | Új kép feltöltése                      | `kep ` (body)   | ✅ Igen     |
| **GET** | /api/images  | Képek lekérése             |                 | ✅ Igen     |
| **POST**| /api/addcategory      | Új kategória felvétele                      | `kep ` `nev ` (body)   | ✅ Igen     |
 | **DELETE** | /api/delcategory | Kategória törlése                           | `id` (URL paraméter) | ✅ Igen     |
 | **POST**| /api/addservices      | Új szolgáltatás felvétele                      |  `kategoria_id`, `nev`, `ar` (body)   | ✅ Igen     |
 | **DELETE** | /api/delservices | Szolgáltatás törlése                           | `id` (URL paraméter) | ✅ Igen     |
 | **PUT** | /api/changeservices  | Szolgáltatás szerkesztése                         |`kategoria_id`, `nev`, `ar` (body), `id` (URL paraméter)   | ✅ Igen     |
| **PUT** | /api/profile  | Profil szerkesztése                         | `name`, `phone`, `email`  (body),  | ✅ Igen     |
| **PUT** | /api/passwordChange  | Jelszó módosítása                         | `oldPassword`, `newPassword`  (body),  | ✅ Igen     |
 | **POST**| /api/contact      | Kapcsolat felvétele                      |  `nev`, `telefon`, `email`, `uzenet` (body)   | ✅ Igen     |
| **POST**| /api/velemeny      | Vélemény írása                     |  `velemeny `  (body)   | ✅ Igen     |
 | **DELETE** | /api/books/:id | Könyv törlése                           | `id` (URL paraméter) | ✅ Igen     |
| **POST**| /api/login      | Bejelentkezés                            | `email`, `psw` (body) | ❌ Nem      |
| **POST**| /api/logout     | Kijelentkezés                            | - | ✅ Igen |
 | **POST**| /api/register   | Regisztráció                             | `email`, `psw`, `felhasznev` (body) | ❌ Nem      |



