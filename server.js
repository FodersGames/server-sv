import express from "express";

const app = express();
app.use(express.json()); // pour parser JSON POST

// Base en mémoire (pour tester)
const db = {};

// -------------------------------------------
// 1️⃣ Admin : ajouter une action pour un joueur
// POST https://ton-url.com/give
// Body JSON : { "uid": "258946847", "variable": 1, "amount": 5 }
app.post("/give", (req, res) => {
  const { uid, variable, amount } = req.body;

  if (!uid || !variable || !amount) {
    return res.status(400).json({ error: "Missing fields" });
  }

  db[uid] = { variable, amount };
  console.log(`Ajouté pour ${uid}: variable=${variable}, amount=${amount}`);
  res.json({ status: "ok" });
});

// -------------------------------------------
// 2️⃣ Joueur : récupérer sa donnée
// GET https://ton-url.com/:uid
app.get("/:uid", (req, res) => {
  const uid = req.params.uid;

  if (!db[uid]) {
    return res.json({ empty: true }); // pas de données
  }

  const data = db[uid];
  delete db[uid]; // 🔥 supprime après lecture
  console.log(`Envoyé à ${uid}:`, data);

  res.json(data);
});

// -------------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Serveur HTTP lancé sur le port", PORT);
});

