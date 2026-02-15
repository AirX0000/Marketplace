# Aura Marketplace 🛍️

Modern multi-vendor marketplace platform with AI-powered features.

## 🚀 Features

- **AI Integration**: Gemini-powered chatbot and automatic product description generation
- **Multi-Role System**: Consumer, Partner (Seller), and Admin interfaces
- **Specialized Categories**: Deep support for Real Estate and Transport
- **Fintech Ready**: Integrated AuraPay wallet system
- **Modern Stack**: React + Node.js + PostgreSQL + Prisma

## 🛠️ Tech Stack

### Frontend
- React 18 + Vite
- TailwindCSS
- React Router
- Leaflet Maps
- Socket.io Client

### Backend
- Node.js + Express
- PostgreSQL + Prisma ORM
- JWT Authentication
- Google Gemini AI
- Socket.io

## 📦 Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Setup

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd marketplace-app
```

2. **Install dependencies**
```bash
# Frontend
npm install

# Backend
cd server
npm install
```

3. **Configure environment**
```bash
# Copy example env file
cd server
cp .env.example .env
# Edit .env with your credentials
```

4. **Setup database**
```bash
cd server
npx prisma migrate deploy
node seed.js
```

5. **Run development servers**
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
npm run dev
```

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@aura.com | password123 |
| Partner | partner@aura.com | password123 |
| User | user@aura.com | password123 |

## 🌐 Деплой (Как запустить в интернете)

Для полной работы приложения нужно запустить две части: **Фронтенд** (сайт) и **Бэкенд** (сервер с базой данных).

### Шаг 1: База данных (Supabase)
1. Создайте проект на [Supabase](https://supabase.com).
2. В настройках базы данных скопируйте **Transaction Connection String** (начинается на `postgres://...`).

### Шаг 2: Бэкенд (Render.com)
1. Зайдите на [Render.com](https://render.com) и создайте **New Blueprint**.
2. Выберите этот репозиторий.
3. Введите переменные окружения:
   - `DATABASE_URL`: ваша строка из Supabase.
   - `GEMINI_API_KEY`: ваш ключ Google AI.
4. Дождитесь статуса **Live** и скопируйте URL (например, `https://aura-api.onrender.com`).

### Шаг 3: Фронтенд (Vercel)
1. Импортируйте репозиторий в [Vercel](https://vercel.com).
2. В настройках добавьте переменную окружения:
   - `VITE_API_URL`: `https://your-render-url.onrender.com/api` (обязательно с `/api` в конце).
3. Нажмите **Deploy**.


## 📄 License

MIT
