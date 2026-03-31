# 🐳 Matisse Food — Déploiement Docker (Subdomain)

Ce guide explique comment déployer l'application sur votre VPS en utilisant **Docker** et comment configurer votre Nginx (Host) pour le sous-domaine `matissefood.aimassi.dev`.

## 🛠️ 1. Préparation sur le VPS

### Fichiers requis
Assurez-vous d'avoir les fichiers suivants sur votre serveur :
- `docker-compose.yml` (racine)
- `backend/` (avec son `Dockerfile` et `.env.docker`)
- `frontend/` (avec son `Dockerfile` et `nginx.conf`)

### Configuration de l'environnement
Vérifiez que `backend/.env.docker` contient les bonnes informations, notamment :
```env
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/roue_fortune?schema=public"
JWT_SECRET="votre_secret"
```

---

## 🚀 2. Lancement des Containers

Exécutez la commande suivante à la racine du projet :

```bash
docker compose up -d --build
```

Cela va :
1. Lancer la base de données **PostgreSQL**.
2. Lancer le **Backend** (port interne 3001, migrations et seed auto).
3. Lancer le **Frontend** (accessible sur le port **8080** de votre VPS).

---

## 📡 3. Configuration Nginx (Host)

Puisque vous avez déjà un Nginx sur votre VPS (`aimassi.dev`), ajoutez ce bloc de configuration pour gérer `matissefood.aimassi.dev`.

Créez `/etc/nginx/sites-available/matissefood` :

```nginx
server {
    listen 80;
    server_name matissefood.aimassi.dev;

    location / {
        proxy_pass http://localhost:8080; # Vers le container Frontend
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Optimisation pour les gros uploads si besoin
    client_max_body_size 20M;
}
```

Activez et redémarrez Nginx :
```bash
sudo ln -s /etc/nginx/sites-available/matissefood /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔑 Accès Admin

- **Interface Client** : `https://matissefood.aimassi.dev`
- **Interface Staff** : `https://matissefood.aimassi.dev/admin`
- **Login par défaut** : `admin` / `admin123`

---

## 🧹 Maintenance Docker

- **Logs** : `docker compose logs -f`
- **Arrêt** : `docker compose down`
- **Mise à jour (après changement de code)** :
  ```bash
  git pull
  docker compose up -d --build
  ```
