# pariedl.com

Dunkle persönliche Startseite mit Welcome, About, Projects und Dashboard-Kacheln.

## Inhalt

- Hero mit Willkommen und kurzer Einleitung
- Über-mich-Bereich
- Projekte mit Karten, die in neuen Tabs öffnen
- Dashboard-Kacheln für Subdomains
- Footer mit kleinem Credit

## Nginx

Die Datei [nginx/pariedl.com.conf](nginx/pariedl.com.conf) zeigt ein einfaches Setup:

- `pariedl.com` und `www.pariedl.com` liefern die statische Seite aus
- `manga.pariedl.com` wird per Reverse Proxy auf `127.0.0.1:3001` weitergeleitet

Passe den Port an, falls dein Manga-Dienst woanders läuft.

## Cloudflare public machen

1. Lade die Dateien auf deinen Server nach `/var/www/pariedl.com` hoch.
2. Kopiere die nginx-Config nach `/etc/nginx/sites-available/pariedl.com` und verlinke sie nach `sites-enabled`.
3. Setze im Cloudflare-DNS:
   - `A` Record für `@` auf deine Server-IP
   - `A` Record für `www` auf deine Server-IP
   - `A` Record für `manga` auf deine Server-IP
4. Aktiviere in Cloudflare den Proxy für die Records.
5. Nutze SSL/TLS auf `Full` oder besser `Full (strict)`.
6. Öffne auf dem Server die Ports `80` und `443`.
7. Starte nginx neu.

## Beispiel für die Befehle auf dem Server

```bash
sudo cp /etc/nginx/sites-available/pariedl.com /etc/nginx/sites-available/pariedl.com.bak
sudo ln -s /etc/nginx/sites-available/pariedl.com /etc/nginx/sites-enabled/pariedl.com
sudo nginx -t
sudo systemctl reload nginx
```

## Späterer GitHub-Link

Ersetze den Platzhalter im GitHub-Button einfach mit deinem echten Profil-Link.
