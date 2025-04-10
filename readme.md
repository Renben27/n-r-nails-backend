 # N&R Nails Backend dokumentáció

 ## Projektről
 Az N&R Nails webalkalmazás egy modern és felhasználóbarát platform, amely kifejezetten egy körömszalon igényeire lett szabva. A projekt célja egy olyan online felület létrehozása volt, ahol az ügyfelek könnyedén tudnak időpontot foglalni a kívánt szolgáltatásokra, kapcsolatba léphetnek a szalon munkatársaival, valamint megoszthatják tapasztalataikat és véleményüket. A rendszer automatizálja az időpontfoglalási folyamatot, így mind a vendégek, mind a szalon munkatársai számára kényelmesebb és átláthatóbb működést tesz lehetővé. A véleményírási lehetőség pedig hozzájárul a folyamatos fejlődéshez és a vendégek elégedettségének növeléséhez.

---
## Készítette🎀
- Horváth Renáta
- Pásztór Nóra

---
## Fejlesztői környezet
- Node.js
- MySQL

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

 
