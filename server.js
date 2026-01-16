// server.js
import express from "express";
import cors from "cors"; // <--- Ajout de cors

const app = express();

// Middlewares
app.use(express.json());
app.use(cors()); // <--- Permet les requêtes cross-origin depuis TurboWarp/Scratch

// Base de données temporaire en mémoire
const db = {};

// 🔐 Mot de passe récupéré depuis Replit (SECRET)
const ADMIN_KEY = process.env.ADMIN_KEY;

// ------------------ ENDPOINTS ------------------

// Endpoint ADMIN sécurisé pour /give
app.post("/give", (req, res) => {
  const { uid, variable, amount, key } = req.body;

  // Vérification mot de passe
  if (key !== ADMIN_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Vérification des champs
  if (!uid || variable === undefined || amount === undefined) {
    return res.status(400).json({ error: "Missing fields" });
  }

  // Stockage de l'action
  db[uid] = { 
    variable: String(variable), 
    amount: String(amount) 
  };
  console.log("Ajouté :", uid, variable, amount);

  res.json({ status: "ok" });
});

// Endpoint JOUEUR (Scratch / TurboWarp)
app.get("/:uid", (req, res) => {
  const uid = req.params.uid;

  if (!db[uid]) {
    return res.json({ empty: true });
  }

  const data = db[uid];
  delete db[uid]; // usage unique

  console.log("Envoyé à", uid, data);
  res.json(data);
});

// ------------------ ENDPOINT STATUS ------------------

// Valeur du status en mémoire (persistante tant que le serveur tourne)
let statusValue = "offline"; // valeur par défaut

// POST /status -> modifier le status (admin uniquement)
app.post("/status", (req, res) => {
  const { value, key } = req.body;

  // Vérification mot de passe admin
  if (key !== ADMIN_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Vérification que la valeur est fournie
  if (!value) {
    return res.status(400).json({ error: "Missing value" });
  }

  // Mise à jour du status
  statusValue = String(value);
  console.log("Status mis à jour :", statusValue);

  res.json({ status: "ok", value: statusValue });
});

// GET /status -> obtenir la valeur actuelle du status
app.get("/status", (req, res) => {
  res.json({ status: statusValue });
});

// ------------------ LANCEMENT SERVEUR ------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("Serveur HTTP lancé sur le port", PORT);
});
