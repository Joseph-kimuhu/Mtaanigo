# MtaaniGo - Location-Based Service Marketplace

MtaaniGo is a location-based service marketplace for Kenya that connects customers with nearby service providers instantly. Think of it as Uber for services—from barbers and nail technicians to plumbers, mechanics, cleaners, and electricians.

## Features

- **Live Map**: See nearby providers on a map with real-time availability (🟢 Available, 🔴 Busy, 🟡 Offline)
- **Available Now**: Instantly find providers available right now in your area
- **Service Requests**: Create requests and the nearest provider gets notified
- **Real-Time Tracking**: Track provider status (accepted → on the way → arrived)
- **Chat & Call**: Built-in communication between customers and providers
- **Ratings & Reviews**: Rate providers after service completion
- **Payments**: M-Pesa integration for seamless payments
- **Provider Dashboard**: Providers can go online/offline, accept jobs, track earnings

## Tech Stack

### Backend
- **FastAPI** - High-performance Python API
- **SQLAlchemy** - ORM for database operations
- **PostgreSQL** - Primary database
- **JWT Auth** - Secure authentication
- **Firebase** - Push notifications
- **M-Pesa API** - Payment integration

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool
- **Leaflet** - Interactive maps
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling
- **Axios** - HTTP client

## Project Structure

```
mtaanigo/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── config.py
│   │   ├── enums.py
│   │   ├── models/
│   │   │   └── models.py
│   │   ├── routes/
│   │   │   ├── auth.py
│   │   │   ├── categories.py
│   │   │   ├── requests.py
│   │   │   ├── messages.py
│   │   │   ├── ratings.py
│   │   │   └── payments.py
│   │   ├── schemas/
│   │   │   └── schemas.py
│   │   └── services/
│   │       ├── auth.py
│   │       └── location.py
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── CategoryCard.jsx
    │   │   └── MapComponent.jsx
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── HomePage.jsx
    │   │   ├── RequestServicePage.jsx
    │   │   └── RequestsPage.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── services/
    │   │   ├── api.js
    │   │   ├── authService.js
    │   │   ├── categoryService.js
    │   │   └── requestService.js
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```

## Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+
- Git

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up PostgreSQL database:
```bash
createdb mtaanigo
```

5. Create a `.env` file in the backend directory:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mtaanigo
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
MPESA_CONSUMER_KEY=your-mpesa-consumer-key
MPESA_CONSUMER_SECRET=your-mpesa-consumer-secret
MPESA_SHORTCODE=your-shortcode
MPESA_PASSKEY=your-passkey
```

6. Seed service categories:
```bash
python -m app.seed
```

7. Run the backend server:
```bash
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```env
VITE_API_URL=http://localhost:8000/api
```

4. Run the development server:
```bash
npm run dev
```

5. Open http://localhost:5173 in your browser

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get access token
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update current user
- `POST /api/auth/provider` - Create provider profile
- `PUT /api/auth/provider` - Update provider profile
- `GET /api/auth/provider` - Get provider profile

### Categories
- `GET /api/categories/` - Get all service categories
- `GET /api/categories/{id}` - Get specific category
- `GET /api/categories/nearby?lat=&lon=&category_id=&radius_km=` - Get nearby providers
- `GET /api/categories/available-now?lat=&lon=&category_id=&radius_km=` - Get available providers now
- `POST /api/categories/{id}/services` - Add provider service

### Service Requests
- `POST /api/requests/` - Create service request
- `GET /api/requests/` - Get my requests
- `GET /api/requests/{id}` - Get specific request
- `PUT /api/requests/{id}` - Update request
- `POST /api/requests/{id}/accept` - Accept request (providers)
- `POST /api/requests/{id}/complete` - Complete request

### Messages
- `GET /api/messages/request/{id}` - Get messages for a request
- `POST /api/messages/request/{id}` - Send message

### Ratings
- `POST /api/ratings/` - Create rating
- `GET /api/ratings/provider/{id}` - Get provider ratings

### Payments
- `POST /api/payments/` - Create payment
- `GET /api/payments/{id}` - Get payment details

## User Roles

- **Customer**: Browse services, create requests, chat with providers, rate providers
- **Provider**: Set up profile, go online/offline, accept requests, track earnings
- **Admin**: Full access to all features

## Revenue Model

- Commission: 5-15% per completed service
- Premium Accounts: Monthly subscriptions for featured placement
- Sponsored Listings: Businesses pay for priority visibility

## Unique Features

- **Available Now**: Instantly find the closest available provider for a specific service
- **Live Map**: See provider locations and status in real-time
- **M-Pesa Integration**: Seamless payments using Kenya's popular mobile money

## License

MIT
