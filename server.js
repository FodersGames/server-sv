// server.js
import express from "express";
import cors from "cors";

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Base de données temporaire en mémoire
const db = {};

// 🔐 Clé admin
const ADMIN_KEY = process.env.ADMIN_KEY;

// ------------------ STATUS (DOIT ÊTRE AVANT /:uid) ------------------

// Valeur du status (persistante tant que le serveur tourne)
let statusValue = "offline";

// POST /status -> modifier le status (admin uniquement)
app.post("/status", (req, res) => {
  const { value, key } = req.body;

  if (key !== ADMIN_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!value) {
    return res.status(400).json({ error: "Missing value" });
  }

  statusValue = String(value);
  console.log("Status mis à jour :", statusValue);

  res.json({ status: "ok", value: statusValue });
});

// GET /status -> récupérer le status
app.get("/status", (req, res) => {
  res.json({ status: statusValue });
});

// ------------------ GIVE ------------------

app.post("/give", (req, res) => {
  const { uid, variable, amount, key } = req.body;

  if (key !== ADMIN_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!uid || variable === undefined || amount === undefined) {
    return res.status(400).json({ error: "Missing fields" });
  }

  db[uid] = {
    variable: String(variable),
    amount: String(amount)
  };

  console.log("Ajouté :", uid, variable, amount);
  res.json({ status: "ok" });
});

// ------------------ JOUEUR (TOUJOURS EN DERNIER) ------------------

app.get("/:uid", (req, res) => {
  const uid = req.params.uid;

  if (!db[uid]) {
    return res.json({ empty: true });
  }

  const data = db[uid];
  delete db[uid];

  console.log("Envoyé à", uid, data);
  res.json(data);
});

// ------------------ LANCEMENT SERVEUR ------------------

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("Serveur HTTP lancé sur le port", PORT);
});
