<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/banner-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="docs/banner-light.svg">
    <img src="docs/banner-light.svg" alt="hooktail" width="360">
  </picture>
</p>

<p align="center">
  <img alt="license" src="https://img.shields.io/badge/license-MIT-blue?style=flat-square">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-black?logo=nextdotjs&style=flat-square">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178c6?logo=typescript&logoColor=white&style=flat-square">
  <img alt="Postgres" src="https://img.shields.io/badge/Postgres-4169e1?logo=postgresql&logoColor=white&style=flat-square">
  <img alt="Tailwind" src="https://img.shields.io/badge/Tailwind-06b6d4?logo=tailwindcss&logoColor=white&style=flat-square">
  <img alt="deployed on Vercel" src="https://img.shields.io/badge/Vercel-deployed-black?logo=vercel&style=flat-square">
</p>

<p align="center">
  A request bin for debugging webhooks.
</p>

<p align="center">
  <a href="https://hooktail.vercel.app"><b>Open hooktail</b></a>
</p>

## Try it

Open the site and you get a bin with its own URL. Send anything to it:

```bash
curl -X POST https://hooktail.vercel.app/h/<your-id> -d 'hello'
```

The request shows up on the page within a couple of seconds.

## Features

- Private URL per bin, created when you visit
- Any HTTP method, any subpath
- Body, headers, and query string for every request
- JSON body formatting
- Copy a request as curl
- Empty and expired states
- Two-pane layout on desktop, stacked on mobile
- Bins and their requests are deleted after 24 hours

## How it works

Each visit creates a bin with a random id and an expiry time. Every bin has two URLs:

| URL | Purpose |
| --- | --- |
| `/b/<id>` | the page you look at |
| `/h/<id>` | where you send requests |

They are separate because a browser opening the page and curl sending a GET look the same to the server. The page polls for new requests, and a scheduled job deletes expired bins.

## Limits

There are no accounts, so anyone can write to a bin. To keep it usable:

| Limit | Value |
| --- | --- |
| Body size | 256 KB |
| Requests per bin | 200 |
| New bins per IP | 20 per hour |
| Bin lifetime | 24 hours |

Bin ids are random and never listed anywhere, and bin pages are marked `noindex`. Anyone with a bin's URL can read it, so don't send secrets you can't afford to leak.

## Stack

- [Next.js](https://nextjs.org) (App Router) and TypeScript
- [Tailwind CSS](https://tailwindcss.com)
- Postgres on [Neon](https://neon.tech)
- Hosted on [Vercel](https://vercel.com)

## Run locally

```bash
git clone https://github.com/nuvairea/hooktail
cd hooktail
npm install
```

Create a Neon database, run the schema in [`db/schema.sql`](db/schema.sql), then add your connection string to `.env.local`:

```
DATABASE_URL_POOLED=postgres://...
```

```bash
npm run dev
```

## Roadmap

- Optional accounts for longer-lived bins
- Request search

## License

[MIT](LICENSE)
