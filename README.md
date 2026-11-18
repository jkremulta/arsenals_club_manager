# Arsenals Club Manager

<div align="center">

A modern training and game management platform made for a tchoukball club.

Built with React, Express, MongoDB, and TypeScript.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwindcss&logoColor=white)

</div>

---

## The Project

**Arsenals Club Manager** is a training and game management platform designed to help Arsenals Tchoukball Club to manage their daily training sessions through a responsive dashboard.

It replaces manual attendance sheets and game selection processes with a fast, organized digital workflow for coaches and players.

## Main Features

- **Training Sessions** — Create and end active training sessions.
- **Player Attendance** — Check players in and track attendance in real time.
- **Payment Tracking** — Quickly see who has paid and who has not.
- **Late Arrivals** — Automatically identify players arriving after the scheduled time.
- **Player Management** — Organize player names, birthdays, genders, skill levels, and ranks.
- **Manual Check-In** — Allow players to check in by name.
- **Game Selection** — Build a 14-player team from the current attendance list.
- **Skill-Based Selection** — Choose beginner, intermediate, or advanced games.
- **Balanced Rosters** — Selection considers skill level, rank, and games played.
- **Player Substitutions** — Replace initialized players before starting a game.
- **Training Statistics** — Monitor attendance and games played across skill groups.
- **Responsive Dashboard** — Optimized layouts for desktop and mobile screens.
- **Secure Access** — Protect dashboard operations with JWT authentication.

## Dashboard

### Attendance

Search the player roster, check players into the active session, remove them from attendance, and update payment status.

### Game

Review the initialized team, replace players, and start the next game with a clear overview of the current lineup.

### Controls

Start or end training sessions and initialize games according to player skill level.

The dashboard also includes responsive mobile tabs, toast notifications, loading states, empty states, and dark/light theme support.

## Built With

### Frontend

- React 19
- TypeScript
- Vite
- React Router
- TanStack React Query
- Zustand
- Axios
- Tailwind CSS 4
- shadcn-compatible components
- Sonner

### Backend

- Node.js
- Express 5
- TypeScript
- MongoDB
- Mongoose
- JWT
- bcrypt
- Zod

## Technical Highlights

- Shared player and training types between the frontend and API.
- React Query synchronization after attendance and game mutations.
- Zustand for lightweight login and dashboard state management.
- Zod validation for player and game operations.
- Mongoose models for players and training sessions.
- Secure password hashing and JWT authentication.
- Responsive three-column and mobile-tab layouts.
- Express middleware for authentication and API error handling.

## Project Status

Arsenals Club Manager includes a complete core workflow for player registration, training sessions, attendance, payments, late tracking, game initialization, and player substitutions.