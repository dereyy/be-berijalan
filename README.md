# API Admin Management

API untuk manajemen admin dengan fitur CRUD dan autentikasi.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Setup database:

```bash
# Generate Prisma client
npm run prisma:generate

# Run migration
npm run prisma:migrate
```

3. Setup environment variables:
   Buat file `.env` di root project:

```
DATABASE_URL="postgresql://username:password@localhost:5432/nama-database"
NODE_ENV="development"
JWT_SECRET="your-secret-key-here"
```

4. Run development server:

```bash
npm run dev
```

## API Endpoints

### Authentication

#### POST /api/v1/auth/login

Login admin

```json
{
  "username": "admin",
  "password": "password123"
}
```

### Admin Management

#### POST /api/v1/auth/create

Buat admin baru

```json
{
  "username": "admin",
  "password": "password123",
  "email": "admin@example.com",
  "name": "Admin Name"
}
```

#### PUT /api/v1/auth/:id

Update admin

```json
{
  "username": "admin_updated",
  "email": "admin_updated@example.com",
  "name": "Admin Name Updated"
}
```

#### DELETE /api/v1/auth/:id

Hapus admin (soft delete)

## Response Format

Semua response mengikuti format:

```json
{
  "status": true/false,
  "message": "Success/Error message",
  "data": { ... },
  "error": { ... }
}
```
