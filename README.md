TP Express

Installation

1. Depuis le dossier `tp-express`, lancez:

```
npm install
```

2. Démarrer l'application:

```
npm start
```

L'application écoute par défaut sur le port `8080`.

Fonctionnalités

- Pages: Accueil, About, Contact
- Auth simple via formulaire (login/password = `admin` / `admin`). La session conserve l'utilisateur.
- Bouton de déconnexion
- Route `/download` : télécharge un fichier `YYYYMMDD_HHmmss.txt` contenant la date du téléchargement.
- Route `/dab/:amount` : calcule la plus petite combinaison de coupures pour le montant fourni.
- Page 404 dédiée et lien visible dans la navigation.

Remarques

- Tous les modules sont listés dans `package.json` et installables via `npm install`.
- Pour tester le DAB: `http://localhost:8080/dab/123`
