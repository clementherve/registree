# Registree

A lightweight web UI for browsing and managing a self-hosted Docker Registry v2: repositories, tags, manifest details, and tag deletion.

<img src="docs/screenshot.jpg">

## Getting started

```bash
pnpm install
pnpm start
```

The app runs at `http://localhost:4200`.

## Running with Docker

Build the image:

```bash
docker build -t registree .
docker run -p 8080:80 -e REGISTRY_URL=https://registry.example.com registree
```

Note: the registry must send CORS
headers, e.g. via the [Docker Registry `http.headers`
config](https://distribution.github.io/distribution/about/configuration/#http) if the domain is different

```yaml
http:
  headers:
    Access-Control-Allow-Origin: ["http://localhost:8080"]
    Access-Control-Allow-Methods: ["GET", "DELETE", "OPTIONS"]
    Access-Control-Allow-Headers: ["Authorization", "Accept"]
    Access-Control-Expose-Headers: ["Docker-Content-Digest", "Link"]
```
