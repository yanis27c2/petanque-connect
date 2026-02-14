# Instructions de Test - Pétanque Connect

## Prérequis
- Node.js installé.
- PC et Mobile connectés au même réseau Wi-Fi (LAN).

## 1. Démarrer le Serveur (Backend)
Ouvrez un terminal dans le dossier du projet et lancez :
```bash
npm run server
```
*Le serveur démarrera sur le port 3001 (http://0.0.0.0:3001).*

## 2. Démarrer le Client (Frontend)
Ouvrez **un deuxième terminal** et lancez :
```bash
npm run dev -- --host
```
*Vite affichera les adresses d'accès, par exemple `Network: http://192.168.1.XX:5173`.*

## 3. Scénario de Test "PC <-> Mobile"

### Étape A : Sur le PC
1. Ouvrez `http://localhost:5173`.
2. Cliquez sur **S'inscrire** et créez un compte.
3. Allez dans l'onglet **Joueurs** pour vérifier que vous êtes bien connecté.

### Étape B : Sur le Mobile
1. Ouvrez votre navigateur et tapez l'adresse IP affichée par Vite (ex: `http://192.168.1.XX:5173`).
2. Cliquez sur **S'inscrire** et créez un AUTRE compte.
3. Allez dans l'onglet **Joueurs**.

### Étape C : Interaction Temps Réel
1. **Ajout d'ami** : Sur le Mobile, cherchez le "Joueur PC" dans l'onglet Joueurs. Cliquez sur le bouton "Ajouter (+)". L'amitié est validée automatiquement pour le test.
2. **Chat** : Allez dans l'onglet **Messages** sur les deux appareils.
3. Lancez une conversation. Tapez un message sur le Mobile, il doit apparaître instantanément sur le PC !

## Note
Les données sont sauvegardées dans `server/db/*.json`. Pour remettre à zéro, supprimez simplement le contenu de ces fichiers ou relancez `node init_db.mjs`.
