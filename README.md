# Agricultural Products Supply Management System

A full-stack ERP-style web application for managing agricultural product supply chains — from farmers and suppliers to customers.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS, React Router, Axios, Recharts |
| Backend | Node.js, Express.js |
| Database | PostgreSQL with Prisma ORM |
| Auth | JWT + bcrypt, Role-Based Access Control |
| File Upload | Multer (local) or Cloudinary |
| API Docs | Swagger UI |
| Reports | ExcelJS, PDFKit, jsPDF |

## Features

- **4 User Roles**: Admin, Supplier, Farmer, Customer
- **Authentication**: Register, login, forgot/reset password, JWT sessions
- **Product Management**: CRUD, categories, images, stock status
- **Inventory**: Stock in/out, movement history, low-stock alerts
- **Orders**: Shopping cart, checkout, status tracking, invoices (PDF)
- **Deliveries**: Driver assignment, ETA, status updates
- **Reports**: Sales, inventory, supplier performance, customer analytics
- **Notifications**: In-app + email (SMTP configurable)
- **Audit Logs**: Activity tracking for admin
- **UI**: Responsive, dark/light mode, ERP-inspired dashboards

## Project Structure

```
agri-culture/
├── backend/          # Express REST API
│   ├── prisma/       # Schema, migrations, seed
│   └── src/          # Routes, controllers, middleware
├── frontend/         # React SPA
│   └── src/          # Pages, components, context
└── DEPLOYMENT.md     # Production deployment guide
```

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### 1. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE agri_supply;
```

Copy environment file and configure:

```bash
cd backend
cp .env.example .env
# Edit DATABASE_URL and JWT_SECRET in .env
```

### 2. Install dependencies

```bash
npm install          # root (concurrently)
npm run install:all  # backend + frontend
```

Configure the database in `backend/.env` (see `backend/.env.example`).

Push schema and seed:

```bash
npm run db:push
npm run db:seed
```

### 3. Run (frontend + backend)

From the project root:

```bash
npm run dev
```

- **Frontend:** http://localhost:5173  
- **API:** http://localhost:5000  
- **Swagger:** http://localhost:5000/api/docs  

### Run separately (optional)

```bash
npm run dev:backend
npm run dev:frontend
```

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@agrisupply.com | password123 |
| Supplier | supplier@agrisupply.com | password123 |
| Farmer | farmer@agrisupply.com | password123 |
| Customer | customer@agrisupply.com | password123 |

## API Endpoints

| Resource | Base Path |
|----------|-----------|
| Auth | `/api/auth` |
| Users | `/api/users` |
| Products | `/api/products` |
| Orders & Cart | `/api/orders` |
| Deliveries | `/api/deliveries` |
| Inventory | `/api/inventory` |
| Reports | `/api/reports` |
| Notifications | `/api/notifications` |
| Audit Logs | `/api/audit-logs` |

## Environment Variables

See `backend/.env.example` and `frontend/.env.example` for all configuration options including Cloudinary, SMTP, and JWT settings.

## License

ISC
