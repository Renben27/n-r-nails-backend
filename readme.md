 # 📚 N&R Nails Backend dokumentáció

 ## Projekt áttekintés
##### Az N&R Nails webalkalmazás egy modern és felhasználóbarát platform, amely kifejezetten egy körömszalon igényeire lett szabva. A projekt célja egy olyan online felület létrehozása volt, ahol az ügyfelek könnyedén tudnak időpontot foglalni, kapcsolatba léphetnek a szalon munkatársaival, valamint megoszthatják tapasztalataikat és véleményüket. A véleményírási lehetőség pedig hozzájárul a folyamatos fejlődéshez és a vendégek elégedettségének növeléséhez.
---
## Készítette🎀
- Horváth Renáta
- Pásztór Nóra

---
 
## 📑 Tartalomjegyzék

- [Technológiák - fejlesztői környezet](#technológiák--fejlesztői-környezet)
- [Használt csomagok](#használt-csomagok)
- [Telepítés](#telepítés)
- [Projekt szerkezet](#projekt-szerkezet)
- [Adatbázis](#adatbázisű)
- [Adatbázis séma (DrawSQL)](#adatbázis-séma-drawsql)
- [Frontend Link](#frontend-link)
- [API végpontok](#api-végpontok)
- [Biztonság](#biztonság)
- [Postman tesztelés](#postman-tesztelés)

 ---
## Technológiák-fejlesztői környezet 🛠 

- **Node.js**: *Futattókörnyezet, amely lehetővé teszi a JavaScript szerveroldali futtatását.*
- **Express.js**: *Keretrendszer szerveroldali API-k létrehozásához.*
- **MySQL**: *Relációs adatbázis-kezelő rendszer.*
- **JWT Auth**: *Hitelesítési és jogosultságkezelési mechanizmus JSON Web Tokenek segítségével.*
- **dotenv**: *Környezeti változók kezelésére használt csomag.*
- **Postman**: *Tesztelési eszköz API-k funkcionalitásának és válaszainak ellenőrzésére.*

---
## Használt csomagok
- [express](https://www.npmjs.com/package/express)
- [mysql2](https://www.npmjs.com/package/mysql2)
- [bcryptjs](https://www.npmjs.com/package/bcryptjs)
- [dotenv](https://www.npmjs.com/package/dotenv)
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)
- [multer](https://www.npmjs.com/package/multer)
- [fs](https://www.npmjs.com/package/fs)
- [path](https://www.npmjs.com/package/path)
- [validator](https://www.npmjs.com/package/validator)
- [cors](https://www.npmjs.com/package/cors)
- [cookie-parser](https://www.npmjs.com/package/cookie-parser)
```bash
"dependencies": {
    "bcryptjs": "^3.0.2",
    "cookie-parser": "^1.4.7",
    "cors": "^2.8.5",
    "dotenv": "^16.4.7",
    "express": "^4.21.2",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5-lts.1",
    "mysql2": "^3.12.0",
    "path": "^0.12.7",
    "validator": "^13.12.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.9"
  }
  ```
 ---
 ## ⚙️ Telepítés

```bash
git clone  https://github.com/Renben27/n-r-nails-backend.git
npm install
npm run dev
```
---
## Projekt szerkezet
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
A backendhez tartozó frontend itt érhető el: 🔗 [N&R Nails Frontend]()

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
| **PUT** | /api/profile  | Profil szerkesztése                         | `name`, `phone`, `email`  (body)  | ✅ Igen     |
| **PUT** | /api/passwordChange  | Jelszó módosítása                         | `oldPassword`, `newPassword`  (body)  | ✅ Igen     |
 | **POST**| /api/contact      | Kapcsolat felvétele                      |  `nev`, `telefon`, `email`, `uzenet` (body)   | ✅ Igen     |
| **POST**| /api/velemeny      | Vélemény írása                     |  `velemeny `  (body)   | ✅ Igen     |
 | **DELETE** | /api/books/:id | Könyv törlése                           | `id` (URL paraméter) | ✅ Igen     |
| **POST**| /api/login      | Bejelentkezés                            | `email`, `psw` (body) | ❌ Nem      |
| **POST**| /api/logout     | Kijelentkezés                            | - | ✅ Igen |
 | **POST**| /api/register   | Regisztráció                             | `email`, `psw`, `felhasznev` (body) | ❌ Nem      |

 ---
 ## 👩‍💼 Admin
 A bejelentkezésakor a végpont megvizsgálja a szerepkört ami 0 illetve 1-ből áll a 0-user az 1-admin.

 ## Biztonság
- JWT token alapú hitelesítés
- Jelszavak bcryptjs segítségével vannak hashelve
- A .env fájl tartalmaz minden érzékeny adatot – ne oszd meg publikusan!

## Postman tesztelés
Postman tesztelési link-> ![ITT](https://img.shields.io/badge/ITT-purple
)
