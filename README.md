# Lead Management System - MERN Stack

A full-stack Lead Management System built with MongoDB, Express.js, React.js, and Node.js.

## Features

- 🔐 JWT Authentication with httpOnly cookies
- 📊 Lead CRUD operations
- 📈 Server-side pagination and filtering
- 🎨 Modern React UI with AG Grid
- 🗄️ MongoDB Atlas integration
- 🚀 Production ready

## Tech Stack

- **Frontend**: React.js, AG Grid, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT with httpOnly cookies

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- npm or yarn

## Setup Instructions

### 1. MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster
4. Create a database user
5. Whitelist your IP address (or use 0.0.0.0/0 for development)
6. Get your connection string

### 2. Environment Configuration

Create a `.env` file in the backend directory:

```env
NODE_ENV=development
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lead-management-system?retryWrites=true&w=majority
```

### 3. Installation

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 4. Running the Application

#### Option 1: Run both services together
```bash
npm run dev
```

#### Option 2: Run services separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### 5. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Test Credentials:
  - Email: test@example.com
  - Password: test123

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Leads
- `GET /api/leads` - List leads with pagination/filters
- `GET /api/leads/:id` - Get single lead
- `POST /api/leads` - Create new lead
- `PUT /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead

## Database Schema

### User Model
```javascript
{
  email: String (unique, required)
  password: String (required, hashed)
  firstName: String (required)
  lastName: String (required)
  createdAt: Date
  updatedAt: Date
}
```

### Lead Model
```javascript
{
  firstName: String (required)
  lastName: String (required)
  email: String (unique, required)
  phone: String
  company: String
  city: String
  state: String
  source: Enum ['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other']
  status: Enum ['new', 'contacted', 'qualified', 'lost', 'won']
  score: Number (0-100)
  leadValue: Number
  lastActivityAt: Date
  isQualified: Boolean
  user: ObjectId (ref: User)
  createdAt: Date
  updatedAt: Date
}
```

## Deployment

### Backend (Render/Railway/Heroku)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy

### Frontend (Vercel)
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `build`
4. Deploy

## Development

### Seed Database
```bash
cd backend
npm run seed
```

### Reset Database
```bash
cd backend
npm run seed
```

## License

MIT

