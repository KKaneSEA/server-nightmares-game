# Server Nightmares

A fast-paced 3D restaurant simulation game where you play as a waiter trying to keep up with an endless stream of demanding guests. Built with Next.js, React Three Fiber, and physics.

**[Play it live →](http://localhost:3000)**

## About the Game

You're a server at a busy restaurant with 6 tables. Guests constantly make requests for more water, new napkins, directions to the bathroom, splitting the bill 8 ways, etc. You need to click the correct table number before time runs out. Miss 10 requests and you're out!

### How to Play

1. Click **Start Game** to begin your shift.
2. A request appears at the top of the screen (e.g. *"Table 3 wants more bread"*).
3. Click the matching table number in the 3D scene within **2 seconds**.
4. The waiter character walks to the table and a dollar sign animation plays.
5. Miss 10 requests and it's game over!

Your best time is saved locally so you can try to beat your high score.

### Features

- **3D restaurant scene** loaded from a GLTF model with full shadow mapping
- **Animated waiter** that moves to each table you serve
- **Dollar sign animations** on successful service
- **Dynamic request queue** with increasing pressure as unserved requests pile up
- **Ambient restaurant soundtrack** with spatial audio
- **Orbit camera controls** — rotate and zoom to find the right table
- **High score persistence** via localStorage
- **Game over / restart flow** with time tracking

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org) 16 (App Router)
- **3D Rendering:** [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) + [Three.js](https://threejs.org)
- **3D Utilities:** [@react-three/drei](https://github.com/pmndrs/drei) (OrbitControls, Environment, GLTF loader, animations)
- **Physics:** [@react-three/rapier](https://github.com/pmndrs/react-three-rapier)
- **Audio:** [use-sound](https://github.com/joshwcomeau/use-sound)
- **Language:** TypeScript
- **Styling:** custom CSS

## Getting Started

### Prerequisites

- Node.js 18+ recommended
- npm, yarn, pnpm, or bun

### Installation

```bash
git clone <your-repo-url>
cd servernightmares
npm install
```

### Running the Dev Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
servernightmares/
├── app/
│   ├── page.tsx          # Entry point
│   └── App.css           # Global styles
├── components/
│   ├── Home.tsx          # Game logic, state management, UI overlay
│   ├── Scene.tsx         # 3D scene, waiter movement, click handling
│   ├── Loading.tsx       # Suspense fallback while 3D assets load
│   └── Restart.tsx       # Game over screen with score display
├── public/
│   ├── models/
│   │   └── restaurantscene.glb   # 3D restaurant model + animations
│   └── sounds/
│       └── restaurantscene.mp3   # Background music
└── package.json
```

## Game Architecture

**`Home.tsx`** manages all game state: the request queue, miss counter, timers, high score, and game lifecycle (start → play → game over → restart). Requests are generated on a randomized interval (2.5–4s) and expire after 2 seconds if not served.

**`Scene.tsx`** handles the 3D world: loading the GLTF model, detecting clicks on table numbers, animating the waiter's movement between tables using per-frame position interpolation, and toggling dollar sign visibility on successful service.

## Deployment

The easiest way to deploy is with [Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

Make sure your `public/models/` and `public/sounds/` directories are included in the deployment — these static assets are required at runtime.

For other platforms, see the [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying).

## Credits

Made by [Kayla Kane](https://kaylakane.com)
