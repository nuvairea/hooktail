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

## How it works

Each visit creates a bin with a random id and an expiry time. Every bin has two URLs:

| URL | Purpose |
| --- | --- |
| `/b/<id>` | the page you look at |
| `/h/<id>` | where you send requests |

They are separate because a browser opening the page and curl sending a GET look the same to the server. The page polls for new requests, and a scheduled job deletes expired bins.

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
