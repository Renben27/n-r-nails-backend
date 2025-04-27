const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');//file-okhoz
const path = require('path');
const validator = require('validator');
const cors = require('cors');
const cookieParser = require('cookie-parser');


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: 'https://nandrnails.netlify.app',
    credentials: true
}));
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

dotenv.config();
const PORT = process.env.PORT;
const HOSTNAME = process.env.HOSTNAME;

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    timezone: 'Z',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const uploadDir = 'uploads/';
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir)
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const now = new Date().toISOString().split('T')[0];
        cb(null, `${req.user.id}-${now}-${file.originalname}`);
    }
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif|webp|avif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Csak képformátumok megengedettek!'));
        }
    }
});

const JWT_SECRET = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
    const token = req.cookies.auth_token;
    if (!token) {
        return res.status(403).json({ error: 'Nincs token' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Van token, csak épp nem érvényes' });
        }
        req.user = user;
        next();
    });
}

//adatok betöltése
app.get('/api/getProfile', authenticateToken, (req, res) => {
    const felhasznalo_id = req.user.id;
    //console.log(`userid: ${felhasznalo_id}`);

    const sql = 'SELECT * FROM felhasznalok WHERE felhasznalo_id = ?';

    pool.query(sql, [felhasznalo_id], (err, result) => {
        if (err) {
            console.log(`sql hiba: ${err}`);
            return res.status(500).json({ error: 'Hiba az SQL-ben' });
        }
        if (result.length === 0) {
            return res.status(404).json({ error: 'Felhasználó nem található' });
        }

        //console.log("adatok:", result[0]); // Az első elemet íratjuk ki
        return res.status(200).json(result[0]); // Csak az első objektumot küldjük vissza
    });
});
// API végpontok regisztracio KÉSZ
app.post('/api/register', (req, res) => {
    //console.log(req.body)
    const { email, psw, felhasznev } = req.body;
    const errors = [];
    /*console.log(email, psw, felhasznev);*/


    if (!validator.isEmail(email)) {
        errors.push({ error: 'Nem valós email cím!' });
    }

    if (!validator.isLength(psw, { min: 6 })) {
        errors.push({ error: 'A jelszónak legalább 6 karakternek kell lennie!' });
    }

    if (validator.isEmpty(felhasznev)) {
        errors.push({ error: 'Töltsd ki a nevet!' });
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }
    pool.query("SELECT * FROM felhasznalok WHERE email = ? OR felhasznev = ?", [email, felhasznev], (err, result) => {
        //console.log(result)
        if (err) {
            console.log(`felhasználó ellenőrzés: ${err}`);

            return res.status(500).json({ error: "Sql hiba" })
        }

        if (result.length > 0) {
            return res.status(500).json({ error: "Email vagy felhasználónév már használatban" })
        }
        /*console.log(`felhasználó ellenőrzés eredménye: ${result}`);*/

        bcrypt.hash(psw, 10, (err, hash) => {
            if (err) {
                console.log(`bcrypt hiba: ${err}`);

                return res.status(500).json({ error: 'Hiba a hashelés során' });
            }

            const sql = 'INSERT INTO felhasznalok (email, psw, felhasznev, szerepkor) VALUES (?, ?, ?, "0")';

            pool.query(sql, [email, hash, felhasznev], (err, result) => {
                if (err) {
                    console.log(`reg hiba sql-ben: ${err}`);

                    return res.status(500).json({ error: 'Sql Hiba' });
                }
                /*console.log(`sikeres reg: ${result}`);*/

                res.status(201).json({ message: 'Sikeres regisztráció!' });
            });
        });
    })
});
//login KÉSZ
app.post('/api/login', (req, res) => {

    const { email, psw } = req.body;
    const errors = [];

    if (!email || !validator.isEmail(email)) {
        errors.push({ error: 'Adj meg egy érvényes email címet' });
    }
    if (!psw || validator.isEmpty(psw)) {
        errors.push({ error: 'Add meg a jelszót' });
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    const sql = 'SELECT * FROM felhasznalok WHERE email = ?';
    pool.query(sql, [email], (err, result) => {
        if (err) {
            console.error("SQL hiba:", err);
            return res.status(500).json({ error: 'Hiba az adatbázisban' });
        }

        if (result.length === 0) {
            return res.status(404).json({ error: 'A felhasználó nem található' });
        }

        const user = result[0];
        const isAdmin = user.szerepkor;

        bcrypt.compare(psw, user.psw, (err, isMatch) => {
            if (err) {
                console.error("Bcrypt hiba:", err);
                return res.status(500).json({ error: 'Hiba a jelszó ellenőrzésénél' });
            }

            if (isMatch) {
                const token = jwt.sign(
                    { id: user.felhasznalo_id, isAdmin: user.szerepkor === 'admin' }, // isAdmin ellenőrzés
                    JWT_SECRET,
                    { expiresIn: '1y' }
                );

                res.cookie('auth_token', token, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'none',
                    domain: '.nandrnails.netlify.app',
                    path: '/',
                    maxAge: 1000 * 60 * 60 * 24 * 30 * 12
                });

                return res.status(200).json({
                    message: 'Sikeres bejelentkezés!',
                    isAdmin
                });
            } else {
                return res.status(401).json({ error: 'Rossz jelszó' });
            }
        });
    });
});

//logout KÉSZ
app.post('/api/logout', authenticateToken, (req, res) => {
    res.clearCookie('auth_token', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        domain: '.nandrnails.netlify.app',
        path: '/'
    });
    return res.status(200).json({ message: 'Sikres kijelentkezés!' });
});
//tesztelés a jwt-re KÉSZ

app.get('/api/logintest', authenticateToken, (req, res) => {
    return res.status(200).json({ message: ' Bent vagy ;)' });
});

app.get('/api/images', authenticateToken, (req, res) => {
    sql = 'SELECT kep FROM munkaink'
    pool.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Hiba az SQL-ben' })
        }
        if (result.length === 0) {
            return res.status(404).json({ error: 'Nincs még munkánk' })
        }
        return res.status(200).json(result);
    })
})

// profil szerkesztés
app.put('/api/profile', authenticateToken, (req, res) => {
    const felhasznalo_id = req.user.id;
    const { name, phone, email } = req.body;

    const sql = ' UPDATE felhasznalok SET nev = COALESCE(NULLIF(?, ""),nev), email = COALESCE(NULLIF(?, ""),email), telefon = COALESCE(NULLIF(?, ""),telefon) WHERE felhasznalo_id=?';

    pool.query(sql, [name, email, phone, felhasznalo_id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Hiba az sql-ben!' });
        }
        console.log(result);
        return res.status(200).json({ message: 'Profil módosítva!' });
    })
})
/*
// profilename szerkesztese
app.put('/api/editProfileName', authenticateToken, (req, res) => {
    const felhasznalo_id = req.user.id;
    const felhasznev = req.body.felhasznev;

    const sql = ' UPDATE felhasznalok SET felhasznev = COALESCE(NULLIF(?, ""),felhasznev) WHERE felhasznalo_id=?';
    pool.query(sql, [felhasznev, felhasznalo_id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Hiba az sql-ben!' });
        }
        return res.status(200).json({ message: 'Profil név módosítva!' });
    })
});
*/
//psw mododsítas
/*app.put('/api/editProfilePsw', authenticateToken, (req, res) => {
    const felhasznalo_id = req.user.id;
    const psw = req.body.psw;
    const salt = 10;

    if (psw === '' || !validator.isLength(psw, { min: 6 })) {
        return res.status(400).json({ error: 'A jelszónak min 6 karakternek kell lenni!' });
    };
    bcrypt.hash(psw, salt, (err, hash) => {
        if (err) {
            return res.status(500).json({ error: 'Hiba a sózáskor!' });

        }
        const sql = ' UPDATE felhasznalok SET psw = COALESCE(NULLIF(?, ""),psw) WHERE felhasznalo_id=?';
        pool.query(sql, [hash, felhasznalo_id], (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: 'Hiba az sql-ben!' });
            }
            return res.status(200).json({ message: 'Jelszó módosítva ki leszel jelentkeztetve!' });
        });
    });
});*/
app.put('/api/passwordChange', authenticateToken, (req, res) => {
    const felhasznalo_id = req.user.id;
    const { oldPassword, newPassword } = req.body;

    if (!validator.isLength(newPassword, { min: 6 })) {
        return res.status(400).json({ error: 'A jelszónak legalább 6 hosszúnak kell lennie' });
    }
    const sql = 'SELECT psw FROM felhasznalok WHERE felhasznalo_id = ?';
    pool.query(sql, [felhasznalo_id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Hiba az SQL-ben' });
        }

        if (result.length === 0) {
            return res.status(404).json({ error: 'Nincs ilyen felhasználó' });
        }

        const felhasznalo = result[0];

        bcrypt.compare(oldPassword, felhasznalo.psw, (err, isMatch) => {
            if (isMatch) {
                bcrypt.hash(newPassword, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({ error: 'Hiba a sózáskor!' });
                    }

                    const sqlUpdate = 'UPDATE felhasznalok SET psw = COALESCE(NULLIF(?, ""), psw) WHERE felhasznalo_id = ?';
                    pool.query(sqlUpdate, [hash, felhasznalo_id], (err, result) => {
                        if (err) {
                            return res.status(500).json({ error: 'Hiba az SQL-ben' });
                        }
                        return res.status(200).json({ message: 'Jelszó frissítve' });
                    });
                });
            } else {
                return res.status(401).json({ error: 'Rossz a jelszó' });
            }
        });
    });
});
/*const editPassword = (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user_id = req.user.id;

    if (!validator.isLength(newPassword, { min: 6 })) {
        return res.status(400).json({ error: 'A jelszónak legalább 6 hosszúnak kell lennie' });
    }
    const sql = 'SELECT password FROM users WHERE user_id = ?';
    db.query(sql, [user_id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Hiba az SQL-ben' });
        }

        if (result.length === 0) {
            return res.status(404).json({ error: 'Nincs ilyen felhasználó' });
        }

        const user_id = result[0];

        bcrypt.compare(oldPassword, user_id.password, (err, isMatch) => {
            if (isMatch) {
                bcrypt.hash(newPassword, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({ error: 'Hiba a sózáskor!' });
                    }

                    const sqlUpdate = 'UPDATE users SET password = COALESCE(NULLIF(?, ""), password) WHERE user_id = ?';
                    db.query(sqlUpdate, [hash, user_id], (err, result) => {
                        if (err) {
                            return res.status(500).json({ error: 'Hiba az SQL-ben' });
                        }
                        return res.status(200).json({ message: 'Jelszó frissítve' });
                    });
                });
            } else {
                return res.status(401).json({ error: 'Rossz a jelszó' });
            }
        });
    });
};*/

//új képek uploads feltöltése
app.post('/api/upload', authenticateToken, upload.single('kep'), (req, res) => {
    const felhasznalo_id = req.user.id;
    const kep = req.file ? req.file.filename : null;
    if (kep === null) {
        return res.status(400).json({ error: 'Válassz ki egy képet' });
    }

    const sql = 'INSERT INTO munkaink (munka_id , felhasznalo_id , kep) VALUES (NULL, ?, ?)';
    pool.query(sql, [felhasznalo_id, kep], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Hiba az SQL-ben' })
        }
        return res.status(201).json({ message: 'Kép feltöltve', munka_id: result.insertId });
    });

});


//idopontfoglalas
app.post('/api/booking', authenticateToken, (req, res) => {
    const felhasznalo_id = req.user.id;
    const { datum, szolgaltatas_id } = req.body;
    console.log(felhasznalo_id, datum, szolgaltatas_id);

    if (!datum) {
        return res.status(400).json({ error: 'Nincs kiválasztott időpont!' });
    }

    const sql = 'INSERT INTO `foglalasok` (`foglalas_id`, `felhasznalo_id`, `datum`, `szolgaltatas_id`) VALUES (NULL, ?, ?, ?)';

    pool.query(sql, [felhasznalo_id, datum, szolgaltatas_id], (error, results) => {
        if (error) {
            console.error('SQL Hiba:', error);  // SQL hiba naplózása
            return res.status(500).json({ error: 'Hiba történt a foglalás során!' });
        }

        console.log('SQL eredmény:', results);  // A sikeres SQL válasz naplózása
        return res.status(200).json({ message: 'Sikeres foglalás!' });
    });
});
//kategóriák lekérése a kirajzoláshoz services.html-ben
app.get('/api/services', (req, res) => {
    const query = `
        SELECT k.kategoria_id, k.nev AS kategoria_nev, k.kep, s.szolgaltatas_id, s.nev AS szolgaltatas_nev, s.ar
        FROM kategoriak k
        LEFT JOIN szolgaltatasok s ON k.kategoria_id = s.kategoria_id
        ORDER BY k.kategoria_id, s.szolgaltatas_id;
    `;

    pool.query(query, (err, result) => {
        if (err) {
            console.log('Adatbázis hiba:', err);
            return res.status(500).json({ error: 'Adatbázis hiba' });
        }
        res.json(result.rows);
    });
});

// a server.js-ben vagy ahol a backend fut

app.get('/api/category-data/:kategoria_id', (req, res) => {
    const kategoriaId = req.params.kategoria_id;

    pool.query('SELECT nev, kep FROM kategoriak WHERE kategoria_id = ?', [kategoriaId], (err, categoryResult) => {
        if (err) {
            console.log('Hiba a kategória lekérdezésekor:', err);
            return res.status(500).json({ error: 'Adatbázis hiba (kategória)' });
        }

        if (categoryResult.length === 0) {
            return res.status(404).json({ error: 'Nincs ilyen kategória' });
        }

        const kategoria = categoryResult[0];

        pool.query('SELECT szolgaltatas_id, nev, ar FROM szolgaltatasok WHERE kategoria_id = ?', [kategoriaId], (err, servicesResult) => {
            if (err) {
                console.log('Hiba a szolgáltatások lekérdezésekor:', err);
                return res.status(500).json({ error: 'Adatbázis hiba (szolgáltatások)' });
            }

            res.json({
                kategoria,
                szolgaltatasok: servicesResult
            });
        });
    });
});
app.get('/api/categories-with-services', (req, res) => {
    const sql = `
      SELECT k.kategoria_id, k.nev AS kategoria_nev, k.kep,
             s.szolgaltatas_id, s.nev AS szolgaltatas_nev, s.ar
      FROM kategoriak k
      LEFT JOIN szolgaltatasok s ON k.kategoria_id = s.kategoria_id
      ORDER BY k.kategoria_id, s.szolgaltatas_id
    `;

    pool.query(sql, (err, rows) => {//result-rows
        if (err) {
            console.error('Hiba az adatbázis lekérdezéskor:', err);
            res.status(500).json({ error: 'Adatbázis hiba' });
            return;
        }

        const categories = {};

        rows.forEach(row => {   // <-- most jó, mert van rows!
            if (!categories[row.kategoria_id]) {
                categories[row.kategoria_id] = {
                    kategoria_id: row.kategoria_id,
                    nev: row.kategoria_nev,
                    kep: row.kep,
                    szolgaltatasok: []
                };
            }

            if (row.szolgaltatas_id) {
                categories[row.kategoria_id].szolgaltatasok.push({
                    szolgaltatas_id: row.szolgaltatas_id,
                    nev: row.szolgaltatas_nev,
                    ar: row.ar
                });
            }
        });

        res.json(Object.values(categories));
    });
});


//kategoria felvitel
app.post('/api/addcategory', authenticateToken, upload.single('kep'), (req, res) => {
    const { nev } = req.body;
    const kep = req.file ? req.file.filename : null;
    if (kep === null) {
        return res.status(400).json({ error: 'Válassz ki egy képet' });
    }

    const sql = (' INSERT INTO `kategoriak` (`kategoria_id`, `nev`, `kep`) VALUES (NULL, ?, ?);');
    pool.query(sql, [nev, kep], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Hiba' });
        }
        console.log(result);
        return res.status(201).json({ message: 'Sikeres felvitel', kategoria_id: result.insertId });
    });
});
//kategoria törlés
app.delete('/api/delcategory/:kategoria_id', authenticateToken, (req, res) => {
    const { kategoria_id } = req.params;
    const sql = ('DELETE FROM kategoriak WHERE `kategoriak`.`kategoria_id` = ?');
    pool.query(sql, [kategoria_id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Hiba' });
        }
        return res.status(201).json({ message: 'Sikeres törlés' });
    })
});

//szolgaltatas feltooltés
app.post('/api/addservices', authenticateToken, (req, res) => {
    const { kategoria_id, nev, ar } = req.body;
    const sql = (' INSERT INTO `szolgaltatasok` (`szolgaltatas_id`, `kategoria_id`, `nev`, `ar`) VALUES (NULL, ?, ?, ?)');
    pool.query(sql, [kategoria_id, nev, ar], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Hiba' });
        }
        console.log(result);
        return res.status(201).json({ message: 'Sikeres felvitel' });
    })
});
//szolgalt törlés
app.delete('/api/delservices/:szolgaltatas_id', authenticateToken, (req, res) => {
    const szolgaltatas_id = req.params.szolgaltatas_id;
    console.log(szolgaltatas_id);
    const sql = ('DELETE FROM szolgaltatasok WHERE szolgaltatasok.szolgaltatas_id = ?');
    pool.query(sql, [szolgaltatas_id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Hiba' }, err);
        }
        return res.status(201).json({ message: 'Sikeres törlés' });
    })
});
//szolg mosoditas
app.put('/api/changeservices/:szolgaltatas_id', (req, res) => {
    const { szolgaltatas_id } = req.params;
    const { kategoria_id, nev, ar } = req.body;
    console.log(szolgaltatas_id, kategoria_id, nev, ar);
    const sql = 'UPDATE `szolgaltatasok` SET `nev` = ?, `ar` = ? WHERE `szolgaltatasok`.`szolgaltatas_id` = ?;';
    pool.query(sql, [kategoria_id, nev, ar, szolgaltatas_id], function (err, result) {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Hiba' }, err);
        }
        return res.status(201).json({ message: 'Sikeres módosítás' });
    })
});
/*app.post("/api/get-service-id", async (req, res) => {
    const { service } = req.body; // Pl. "Esztétikai pedikűr"
    if (!service) {
        return res.status(400).json({ error: "Nincs kiválasztott szolgáltatás" });
    }

    const sql = `SELECT szolgaltatas_id FROM szolgaltatasok WHERE nev = ?`;

    pool.query(sql, [service], (err, results) => {
        if (err) return res.status(500).json({ error: "DB hiba" });
        if (results.length === 0) return res.status(404).json({ error: "Nem található szolgáltatás" });
        
        res.json({ service_id: results[0].szolgaltatas_id });
    });
});
*/

//kapcsolat feltöltés
app.post('/api/contact', authenticateToken, (req, res) => {
    const { nev, telefon, email, uzenet } = req.body;
    console.log(nev, email, telefon, uzenet);

    const sql = 'INSERT INTO `kapcsolat` (kapcsolat_id, `nev`, `telefon`, `email`, `uzenet`)  VALUES (NULL, ?, ?, ?, ?)';

    pool.query(sql, [nev, telefon, email, uzenet], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Hiba' });
        }
        console.log(result);
        return res.status(201).json({ message: 'Sikeres felvitel' });
    })
});

/*vélemények írása*/

app.post('/api/velemeny', authenticateToken, (req, res) => {
    const felhasznalo_id = req.user.id; // A bejelentkezett felhasználó ID-ja
    const { velemeny } = req.body;

    if (!velemeny || velemeny.length < 5) {
        return res.status(400).json({ error: "A vélemény túl rövid!" });
    }

    const sql = "INSERT INTO velemenyek (felhasznalo_id, velemeny) VALUES (?, ?)";/*-datum meg currenttime */
    pool.query(sql, [felhasznalo_id, velemeny], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: "Adatbázis hiba" });
        }
        res.status(201).json({ message: "Vélemény sikeresen mentve!" });
    });
});
/*vélemények lekérése*/
app.get('/api/getopinions', authenticateToken, (req, res) => {
    const limit = 10; // maximum 10 vélemény
    const offset = parseInt(req.query.offset) || 0; // lehet majd lapozni is, ha szükséges

    pool.query(`
        SELECT v.velemeny_id, v.velemeny, v.datum, f.nev
        FROM velemenyek v
        JOIN felhasznalok f ON v.felhasznalo_id = f.felhasznalo_id
        ORDER BY v.datum DESC
        LIMIT ? OFFSET ?
    `, [limit, offset], (err, results) => {
        if (err) {
            console.error('Hiba a vélemények lekérdezésekor:', err);
            return res.status(500).json({ message: 'Adatbázis hiba.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Nincsenek további vélemények.' });
        }

        res.json(results);
    });
});

app.listen(PORT, () => {
    console.log(`IP: https://${HOSTNAME}:${PORT}`);
});