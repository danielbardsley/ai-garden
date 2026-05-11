# Garden Roof Deck / AI Garden Product Spec

## Purpose

Garden Roof Deck / AI Garden is a local-first garden journal for tracking plants, photos, observations, care history, and practical AI-assisted plant care over multiple seasons.

## App type

- Kind: `expo`
- Frontend path: `/apps/garden-roof-deck/`
- API path: `/api/garden-roof-deck/`

## Users

- Primary user: Daniel, tracking a roof-deck/container garden across seasons.
- Near-term usage: mobile-first Expo Go workflow for photo capture and care logging, plus hosted web preview for read-only/development visibility.

## Current product capabilities

- Plant inventory with detail pages, timeline, photos, care history, care profile, recommendations, and Ask AI.
- Local SQLite persistence for garden records and AI conversation context.
- Camera capture on mobile with AI identification/categorization support.
- FastAPI backend for AI agent health, photo identification, photo categorization, plant chat, care profile drafting, and recommendation generation.
- Weather/zone context on the home screen.

## Deferred capabilities

- Photo-library import/media picker flows.
- Dedicated reminders and profile screens.
- Cloud sync and multi-device conflict handling.
- Hosted production mobile update pipeline beyond local Expo Go/dev iteration.

## Architecture

- Expo React Native frontend using Expo Router.
- Local-first SQLite data model behind repository/service classes.
- FastAPI backend under `/api/garden-roof-deck/` for AI agent operations.
- OpenClaw App Platform routing keeps hosted web under `/apps/garden-roof-deck/`.
