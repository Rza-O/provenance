# Provenance

> A research search engine for engineering knowledge, built from scratch. It shows where every answer comes from.

**Status:** Week 1 of 12, building the first crawler. 🚧

## What it does
- **Search mode:** type a query, get ranked pages from Provenance's own index.
- **Research mode:** an agent plans searches, reads pages, compares sources, and writes an answer with citations. *(Week 9+)*

## Demo
_Coming at the end of Week 1: GIF of the first working search._

## Tech
TypeScript · Bun · Next.js · PostgreSQL · Docker · Terraform · AWS

## Docs
- [The idea](docs/IDEA.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Roadmap](docs/ROADMAP.md)
- [Decisions](docs/decisions.md)
- [Devlog](DEVLOG.md)

## Run it locally
_Coming soon._

## Crawling policy
Provenance only crawls an allowlist of public engineering sites, follows robots.txt, rate-limits every domain, and identifies itself as `ProvenanceBot`.
