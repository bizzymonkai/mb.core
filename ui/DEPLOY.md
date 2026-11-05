# Deploy static prototypes to the droplet

No npm. No build. The `ui/` folder is pure HTML/CSS/JS.

Target: `https://monkeypanel.com/prototype/`

## On the droplet (one-time)

Assume Nginx is already serving monkeypanel.com and Certbot has the cert.

1. Clone or pull the repo somewhere readable by Nginx, e.g.:

```bash
cd /var/www
git clone https://github.com/bizzymonkai/mb.core.git
# or, if already cloned:
cd /var/www/mb.core && git pull
```

2. Add a location block inside the monkeypanel.com server block:

```nginx
location /prototype/ {
    alias /var/www/mb.core/ui/;
    index index.html;
    try_files $uri $uri/ /prototype/index.html;
}
```

Note: `alias` maps `/prototype/` to the contents of `ui/`.  
So `/prototype/` serves `ui/prototype/index.html` only if you adjust the alias, or you can point the alias directly:

```nginx
location /prototype/ {
    alias /var/www/mb.core/ui/prototype/;
    index index.html;
}
location /prototype/dashboard/ {
    alias /var/www/mb.core/ui/dashboard/;
    index index.html;
}
```

Or simpler — serve the whole `ui/` tree under `/prototype/` and put the index at `ui/index.html` (move or copy `ui/prototype/index.html` to `ui/index.html`).

3. Reload Nginx:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

## Updating

On the droplet:

```bash
cd /var/www/mb.core && git pull
```

That is the entire deploy. No build, no npm.

## Alternative: rsync from local

If you prefer not to git-pull on the droplet:

```bash
rsync -avz --delete ui/ user@droplet:/var/www/monkeypanel/prototype/
```

Then Nginx aliases `/prototype/` to that directory.

## Why this is better than a build step

- Prototypes stay plain HTML/JS/img.
- GitHub is the source of truth.
- Droplet only needs `git pull` (or rsync).
- Same pattern already used for the other domains on the droplet.
