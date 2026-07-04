# Registree

A lightweight web UI for browsing and managing a self-hosted Docker Registry v2 (`registry:2`): repositories, tags, manifest details, and tag deletion.

<img src="doc/screenshot.png">

## Features

- Browse and filter repositories, with paginated "load more"
- View tags per repository, and manifest details (digest, size, layers, image config)
- Delete tags — warns when other tags share the same image digest
- HTTP Basic auth login

## Getting started

```bash
npm install
npm start
```

The app runs at `http://localhost:4200`.

## Configuration

The app calls the registry API at the relative path set as `apiBasePath` in `src/environments/environment*.ts` (default `/v2`). It's designed to run same-origin behind a reverse proxy that forwards `/v2/*` to your actual registry, so no CORS setup is needed in production.

For local development against a real registry, use the Angular dev-server proxy:

```bash
ng serve --proxy-config proxy.conf.json
```

with a `proxy.conf.json` like:

```json
{
  "/v2": {
    "target": "http://localhost:5000",
    "secure": false,
    "changeOrigin": true
  }
}
```

## Testing

```bash
npm test
```

## Tech stack

Angular 19 (standalone components, signals), plain CSS/SCSS — no UI framework.
