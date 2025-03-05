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
    console.log(`userid: ${felhasznalo_id}`);
    
    const sql = 'SELECT * FROM felhasznalok WHERE felhasznalo_id = ?';

    pool.query(sql, [felhasznalo_id], (err, result) => {
        if (err) {
            console.log(`sql hiba: ${err}`);
            
            return res.status(500).json({ error: 'Hiba az SQL-ben' });
        }
        if (result.length === 0) {
            return res.status(404).json({ error: 'Felhasználó nem található' });
        }
        console.log(`adatok: ${result}`);
        
        return res.status(200).json(result); // Küldjük vissza az első elemet
    });
});
// API végpontok regisztracio KÉSZ
app.post('/api/register', (req, res) => {
    //console.log(req.body)
    const { email, psw, felhasznev } = req.body;
    const errors = [];

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
    pool.query("SELECT 1 FROM felhasznalok WHERE email = ? OR felhasznev = ?", [email, felhasznev], (err, result) => {
        //console.log(result)
        if (err) {
            return res.status(500).json({error: "Sql hiba"})
        }

        if (result.length > 0) {
            return res.status(500).json({error: "Email vagy felhasználónév már használatban"})
        }

        bcrypt.hash(psw, 10, (err, hash) => {
            if (err) {
                return res.status(500).json({ error: 'Hiba a hashelés során' });
            }
    
            const sql = 'INSERT INTO felhasznalok( email, psw, felhasznev) VALUES( ?, ?, ?)';
    
            pool.query(sql, [email, hash, felhasznev], (err, result) => {
                if (err) {
                    return res.status(500).json({ error: 'Sql Hiba' });
                }
                res.status(201).json({ message: 'Sikeres regisztráció!' });
            });
        });
    })
});
//login KÉSZ
app.post('/api/login', (req, res) => {
    console.log("Beérkezett kérés:", req.body); // Ellenőrizd a kapott adatokat

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

        bcrypt.compare(psw, user.psw, (err, isMatch) => {
            if (err) {
                console.error("Bcrypt hiba:", err);
                return res.status(500).json({ error: 'Hiba a jelszó ellenőrzésénél' });
            }

            if (isMatch) {
                const token = jwt.sign(
                    { id: user.user_id, isAdmin: user.szerepkor === 'admin' }, // isAdmin ellenőrzés
                    JWT_SECRET,
                    { expiresIn: '1y' }
                );

                res.cookie('auth_token', token, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'lax',
                    maxAge: 1000 * 60 * 60 * 24 * 30 * 12
                });

                return res.status(200).json({ 
                    message: 'Sikeres bejelentkezés!', 
                    isAdmin: user.szerepkor === 'admin' 
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
        sameSite: 'lax'
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
        if(err){
            return res.status(500).json({ error: 'Hiba az SQL-ben' })
        }
        if (result.length === 0) {
            return res.status(404).json({ error: 'Nincs még munkánk' })
        }
        return res.status(200).json(result);
    })
})
//az összes meme (ez esetben kártya/lépek) lekérdezése
app.get('/api/memes', authenticateToken, (req, res) => {
    const sql = 'SELECT uploads.upload_id, uploads.meme, uploads.user_id, users.name, users.profile_pic, COUNT(likes.upload_id) AS "like" FROM uploads JOIN users ON uploads.user_id = users.user_id JOIN likes ON uploads.upload_id = likes.upload_id GROUP BY(upload_id);';
    pool.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Hiba az SQL-ben' })
        }
        if (result.length === 0) {
            return res.status(404).json({ error: 'Nincs még meme' })
        }
        return res.status(200).json(result);
    });
});
// profil szerkesztés
app.put('/api/profile', authenticateToken, (req, res) => {
    const felhasznalo_id = req.user.id;
    const { name, phone, email } =req.body;

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
app.put('/api/editProfilePsw', authenticateToken, (req, res) => {
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
});


app.get('/api/uploads', authenticateToken, (req, res) => {
    const felhasznalo_id = req.user.id;
    const sql = 'SELECT uploads.upload_id, uploads.meme, uploads.user_id, users.name, users.profile_pic, COUNT(likes.upload_id) AS`like`, CASE WHEN EXISTS(SELECT 1 FROM likes WHERE likes.upload_id = uploads.upload_id AND likes.user_id = ?) THEN 1 ELSE 0 END AS alreadyLiked FROM uploads JOIN users ON uploads.user_id = users.user_id LEFT JOIN likes ON uploads.upload_id = likes.upload_id GROUP BY uploads.upload_id';
    /*az sql parancs lekezeli az 1 es 0 ertekeket is*/

    pool.query(sql, [felhasznalo_id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Hiba az SQL-ben' })
        }
        if (result.length === 0) {
            return res.status(404).json({ error: 'Nincs még meme' })
        }
        return res.status(200).json(result);
    });
});

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

app.listen(PORT, () => {
    console.log(`IP: https://${HOSTNAME}:${PORT}`);
});