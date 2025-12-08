# User Management System

Full-stack user management application with authentication, role-based access control, and comprehensive CRUD operations.

## 🚀 Tech Stack

### Backend
- **Node.js** with **Express.js**
- **TypeScript**
- **Prisma ORM** with **PostgreSQL**
- **JWT** authentication with refresh tokens
- **Bcrypt** for password hashing
- **Zod** for validation

### Frontend (Web)
- **Next.js 14** (App Router)
- **React** with **TypeScript**
- **Tailwind CSS**
- **Axios** for API calls
- **Context API** for state management

### Mobile (React Native)
- **React Native** 0.82
- **React Navigation**
- **Axios** with auto token refresh
- **React Native Keychain** (encrypted storage)

---

## 📋 Prerequisites

- **Node.js** >= 18.x
- **PostgreSQL** >= 14.x
- **npm** or **yarn**

---

## 🛠️ Installation & Setup

### 1. Clone Repository

```bash
git clone https://github.com/dafahfabiansyah/user-management-system.git
cd user-management-system
```

---

### 2. Backend Setup

#### Install Dependencies
```bash
cd backend
npm install
```

#### Environment Configuration
Create `.env` file in `backend/` directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/user_management_db"

# JWT Secret Keys
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
REFRESH_TOKEN_SECRET="your-super-secret-refresh-token-key-change-this"

# Server
PORT=3000
NODE_ENV=development
```

**Important:** Replace database credentials with your PostgreSQL credentials.

#### Database Setup

1. **Create PostgreSQL Database:**
```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE user_management_db;
\q
```

2. **Run Migrations:**
```bash
npx prisma migrate dev
```

3. **Seed Database** (Optional - creates test users):
```bash
npx prisma db seed
```

This will create:
- **Admin user:** jane@example.com / password123
- **Staff user:** john@example.com / password123

#### Start Backend Server
```bash
npm start
```

Backend will run on: `http://localhost:3000`

---

### 3. Frontend (Web) Setup

#### Install Dependencies
```bash
cd ../frontend
npm install
```

#### Environment Configuration
Create `.env.local` file in `frontend/` directory:

```env
API_URL=http://localhost:3000
```

#### Start Development Server
```bash
npm run dev
```

Frontend will run on: `http://localhost:3001`

---

## 🧪 Testing the Application

### Web Application

1. Open browser: `http://localhost:3001`
2. Click **Login**
3. Use test credentials:
   - Email: `jane@example.com`
   - Password: `password123`
4. You'll see the dashboard with user list

### API Testing

#### Register New User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "staff"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@example.com",
    "password": "password123"
  }'
```

#### Get Users (Protected)
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 📁 Project Structure

```
febetech/
├── backend/                    # Express.js backend
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   ├── migrations/        # Database migrations
│   │   └── seed.ts           # Database seeder
│   ├── routes/
│   │   ├── auth.routes.ts    # Authentication endpoints
│   │   └── user.routes.ts    # User CRUD endpoints
│   ├── middlewares/
│   │   └── auth.middleware.ts # JWT authentication
│   ├── utils/
│   │   ├── jwt.ts            # JWT utilities
│   │   ├── password.ts       # Password hashing
│   │   └── response.ts       # Response helpers
│   ├── schemas/
│   │   └── auth.schema.ts    # Zod validation schemas
│   └── index.ts              # Express app entry
│
├── frontend/                   # Next.js frontend
│   ├── app/
│   │   ├── page.tsx          # Dashboard (protected)
│   │   ├── login/page.tsx    # Login page
│   │   └── register/page.tsx # Register page
│   ├── components/
│   │   ├── Navbar.tsx        # Navigation bar
│   │   └── ProtectedRoute.tsx # Route protection
│   ├── contexts/
│   │   └── AuthContext.tsx   # Authentication state
│   └── lib/
│       └── api.ts            # Axios client
│
└── mobile/                     # React Native mobile app
    ├── src/
    │   ├── screens/          # App screens
    │   ├── components/       # Reusable components
    │   ├── navigation/       # Navigation setup
    │   ├── contexts/         # State management
    │   └── api/             # API client
    └── android/             # Android build files
```

---

## 🔑 Features

### Authentication
- ✅ User registration
- ✅ Login with email/password
- ✅ JWT access tokens (15 minutes)
- ✅ Refresh tokens (7 days)
- ✅ Automatic token refresh
- ✅ Secure logout

### User Management
- ✅ View all users (paginated)
- ✅ Search by name/email
- ✅ Filter by role (Admin/Staff)
- ✅ Sort by creation date
- ✅ Responsive design (mobile-friendly)

### Security
- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Protected API routes
- ✅ CORS configuration
- ✅ Input validation with Zod

---

## 📊 Database Schema

### User Model
```prisma
model User {
  id            Int            @id @default(autoincrement())
  name          String
  email         String         @unique
  password      String
  role          String         @default("staff")
  createdAt     DateTime       @default(now())
  refreshTokens RefreshToken[]
}
```

### RefreshToken Model
```prisma
model RefreshToken {
  id        Int      @id @default(autoincrement())
  token     String   @unique
  userId    Int
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())
}
```

---

## 🔧 Available Scripts

### Backend
```bash
npm start           # Start development server with nodemon
npm run build       # Build TypeScript to JavaScript
npm run seed        # Seed database with test data
npx prisma studio   # Open Prisma Studio (database GUI)
npx prisma migrate dev # Create new migration
```

### Frontend
```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run start       # Start production server
npm run lint        # Run ESLint
```

---

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token

### Users (Protected)
- `GET /api/users` - Get all users with pagination, search, filter, sort

**Query Parameters:**
- `search` - Search by name/email
- `role` - Filter by role (admin/staff)
- `sortBy` - Sort field (default: createdAt)
- `order` - Sort order (asc/desc)
- `page` - Page number
- `limit` - Items per page

---

## 🐛 Troubleshooting

### Database Connection Error
```
Error: Can't reach database server at localhost:5432
```
**Solution:** Make sure PostgreSQL is running
```bash
# Windows
pg_ctl -D "C:\Program Files\PostgreSQL\14\data" start

# macOS/Linux
sudo service postgresql start
```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution:** Kill process using the port
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill
```

### Prisma Migration Failed
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Or create new migration
npx prisma migrate dev --name init
```

---

## 👥 Default Users

After running `npx prisma db seed`:

| Email | Password | Role |
|-------|----------|------|
| jane@example.com | password123 | admin |
| john@example.com | password123 | staff |

---

## 📝 License

MIT

---

## 👨‍💻 Author

**Dafah Fabiansyah**
- GitHub: [@dafahfabiansyah](https://github.com/dafahfabiansyah)

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📞 Support

If you have any questions or issues, please open an issue on GitHub.
