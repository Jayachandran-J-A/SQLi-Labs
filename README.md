# SQLi-Labs

A black-box web application lab for practising SQL injection discovery and data extraction by hand.
Five ordinary-looking web apps, each with its own frontend, backend and database engine, are served
through a single gateway on one port. Nothing in the apps tells you where the weaknesses are.

> **Intended for authorised learning only.** Run it on an isolated VM or lab network, never on a
> machine exposed to the internet.

## Apps

| Path | App |
|------|-----|
| `/notes/` | NoteVault |
| `/shop/` | Bazaar |
| `/people/` | PeopleHub |
| `/blog/` | Inkwell |
| `/support/` | Support Center |

Identifying the technology behind each app, finding the injection points and extracting the data is
the exercise.

## Requirements

- Docker with the Compose plugin
- About 4 GB of free RAM (the SQL Server container is the heaviest)

## Start

```bash
git clone https://github.com/Jayachandran-J-A/SQLi-Labs.git
cd SQLi-Labs
docker compose up -d --build
```

Open `http://<host-ip>:9000/`. The first start takes a minute or two. `/support/` shows a 502 until
SQL Server finishes initialising (about 40-60 seconds).

If Docker Hub is blocked or intercepted on your network, copy `.env.example` to `.env` and set
`REGISTRY=mirror.gcr.io/library/`.

## Stop / reset

```bash
docker compose stop        # stop, keep data
docker compose start       # start again
docker compose down        # remove containers, keep data
./reset.sh                 # wipe all databases and rebuild from scratch
```

Use `./reset.sh` whenever you have modified or broken the data.

## Ports

Only `9000` is published (all interfaces). The databases are not exposed to the host.
