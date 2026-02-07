## BlogWeb

Full-stack blogging platform with authentication, rich text editor, comments, likes, bookmarks, tags, and profiles.

### Tech Stack
- Frontend: React + Vite + Tailwind CSS
- Backend: Hono (Cloudflare Workers) + Prisma
- Database: PostgreSQL (Aiven)

### Monorepo Structure
- `frontend/` React app
- `backend/` Hono API + Prisma
- `common/` shared Zod schemas

### Local Setup

1) Install dependencies:
```
cd common && npm install
cd ../backend && npm install
cd ../frontend && npm install
```

2) Backend env:
- `backend/.dev.vars` for Workers dev:
```
DATABASE_URL="postgres://..."
PRISMA_ACCELERATE_URL="prisma://..."
JWT_SECRET="..."
```
- `backend/.env` for Prisma CLI:
```
DATABASE_URL="postgres://.../defaultdb?sslmode=require"
```

3) Prisma (backend):
```
cd backend
npx prisma migrate dev
```

4) Run dev servers:
```
cd backend && npm run dev
cd ../frontend && npm run dev
```

### Frontend Config
Update `frontend/src/config.ts`:
```
export const BACKEND_URL = "https://your-backend-url";
```

### Deploy
- Backend: Cloudflare Workers (`backend/`)
- Frontend: Vercel (`frontend/` root directory)

### Prisma Studio
```
cd backend
DATABASE_URL="postgres://.../defaultdb?sslmode=require" npx prisma studio
```
