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
##🧩 Adatbázis séma (DrawSQL) 
- [👉 Nézd meg a DrawSQL diagramot itt](https://drawsql.app/teams/hungarybaross/diagrams/nrnailsv)
- Vagy akár itt is! ![image](https://github.com/user-attachments/assets/0df3c6c4-9fe7-4ac3-9686-c39ba324c559)

 ---
## 🌐 Frontend Link
A backendhez tartozó frontend itt érhető el: 🔗 Frontend alkalmazás

 ---

 ## 📡 API végpontok

Az alábbi táblázatban találhatók az API végpontok és azok leírása. Minden végponthoz tartozik a HTTP metódus, az útvonal, valamint a leírás, hogy mi történik a hívás során.

| Módszer | Útvonal         | Leírás                                   | Paraméterek                       | Hitelesítés |
|---------|-----------------|------------------------------------------|------------------------------------|-------------|
| **GET** | /api/books      | Könyvek listázása                        | -                                  | ✅ Igen     |
| **POST**| /api/books      | Új könyv hozzáadása                      | `title`, `author`, `year` (body)   | ✅ Igen     |
| **GET** | /api/books/:id  | Egy könyv adatainak lekérése             | `id` (URL paraméter)               | ✅ Igen     |
| **PUT** | /api/books/:id  | Könyv frissítése                         | `id` (URL paraméter), `title`, `author`, `year` (body) | ✅ Igen     |
| **DELETE** | /api/books/:id | Könyv törlése                           | `id` (URL paraméter)               | ✅ Igen     |
| **POST**| /api/login      | Bejelentkezés                            | `email`, `password` (body)         | ❌ Nem      |
| **POST**| /api/register   | Regisztráció                             | `email`, `password` (body)         | ❌ Nem      |



