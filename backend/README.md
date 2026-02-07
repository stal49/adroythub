# Adroythub Backend

Backend server for the Adroythub LMS (Learning Management System) platform.

## 🚀 Features

- **User Authentication**: JWT-based authentication with access and refresh tokens
- **Course Management**: Full CRUD operations for courses, lessons, and content
- **Payment Integration**: Razorpay and Stripe payment gateways
- **Admin Dashboard**: Analytics, user management, and content management
- **Real-time Notifications**: System notifications for users and admins
- **Email Service**: Automated emails for registration, activation, and notifications
- **File Uploads**: Cloudinary integration for image and video uploads
- **Caching**: Redis for session management and performance optimization

## 📋 Prerequisites

- Node.js >= 18.x
- MongoDB (local or Atlas)
- Redis (local or cloud)
- Cloudinary account (for file uploads)
- Razorpay/Stripe account (for payments)
- SMTP email service (Gmail, SendGrid, etc.)

## 🛠️ Installation

1. **Clone the repository** (if not already done)
   ```bash
   cd /home/bhupi/code/Job/adroythub/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your actual credentials.

4. **Start the server**
   
   Development mode:
   ```bash
   npm run dev
   ```
   
   Production mode:
   ```bash
   npm start
   ```

## 📁 Project Structure

```
backend/
├── routes/           # API route definitions
├── controllers/      # Request handlers and business logic
├── models/          # Database models and schemas
├── middleware/      # Authentication, error handling, etc.
├── services/        # Business logic services
├── utils/           # Utility functions (JWT, email, Redis, etc.)
├── config/          # Configuration files (Firebase, etc.)
├── mails/           # Email templates (EJS)
├── server.js        # Main server file
├── package.json     # Dependencies and scripts
└── .env.example     # Environment variables template
```

## 🔑 Environment Variables

See `.env.example` for all required environment variables. Key variables include:

- `PORT`: Server port (default: 8000)
- `DB_URL`: MongoDB connection string
- `REDIS_URL`: Redis connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `RAZORPAY_CALM_KEY_ID` & `RAZORPAY_CALM_SECRET`: Razorpay credentials
- `STRIPE_SECRET_KEY`: Stripe secret key
- `SMTP_*`: Email service configuration
- `ALLOWED_ORIGINS`: CORS allowed origins

## 📡 API Endpoints

### Authentication
- `POST /api/registration` - Register new user
- `POST /api/activate-user` - Activate user account
- `POST /api/login` - User login
- `GET /api/logout` - User logout
- `POST /api/social-auth` - Social authentication
- `GET /api/me` - Get current user info
- `POST /api/refresh-token` - Refresh access token

### Courses
- `GET /api/get-courses` - Get all courses
- `GET /api/get-course/:id` - Get single course
- `GET /api/get-course-content/:id` - Get course content (authenticated)
- `POST /api/create-course` - Create course (admin)
- `PUT /api/edit-course/:id` - Edit course (admin)
- `DELETE /api/delete-course/:id` - Delete course (admin)

### Orders & Payments
- `POST /api/create-order` - Create order
- `GET /api/get-orders` - Get all orders (admin)
- `POST /api/payment` - Create payment intent
- `GET /api/payment/stripepublishablekey` - Get Stripe key

### Adroyt Payments (Razorpay)
- `POST /adroyt/create-order` - Create Razorpay order
- `POST /adroyt/verify-payment` - Verify Razorpay payment
- `GET /adroyt/orders` - Get all orders
- `GET /adroyt/payments` - Get all payments

### Analytics (Admin)
- `GET /api/get-users-analytics` - User analytics
- `GET /api/get-courses-analytics` - Course analytics
- `GET /api/get-orders-analytics` - Order analytics

### Notifications (Admin)
- `GET /api/get-all-notifications` - Get all notifications
- `PUT /api/update-notification/:id` - Update notification status

### Layout/CMS
- `GET /api/get-layout/:type` - Get layout data
- `PUT /api/edit-layout` - Edit layout (admin)

## 🔒 Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. User logs in and receives `accessToken` and `refreshToken`
2. Client stores tokens and sends `accessToken` in `Authorization` header:
   ```
   Authorization: Bearer <accessToken>
   ```
3. When `accessToken` expires, use `refreshToken` to get a new one
4. User session is stored in Redis for 7 days

## 💳 Payment Flow

### Razorpay (Adroyt-specific)
1. Client calls `/adroyt/create-order` with amount and currency
2. Server creates Razorpay order and returns order details
3. Client completes payment on Razorpay checkout
4. Client calls `/adroyt/verify-payment` with payment details
5. Server verifies signature and logs payment

### Stripe (Standard LMS)
1. Client calls `/api/payment/stripepublishablekey` to get public key
2. Client calls `/api/payment` to create payment intent
3. Client completes payment with Stripe Elements
4. Client calls `/api/create-order` to finalize order

## 🗄️ Database Collections

- `users` - User accounts and authentication
- `courses` - Course data, content, and reviews
- `orders` - Purchase orders
- `notifications` - System notifications
- `layouts` - CMS content
- `adroyt_orders` - Adroyt-specific orders
- `adroyt_payments` - Adroyt-specific payments

## 🚨 Error Handling

All errors are handled by the global error middleware and return:

```json
{
  "success": false,
  "message": "Error message here"
}
```

## 📝 Logging

Server logs all incoming requests with timestamp and method:
```
[2026-02-07T13:45:00.000Z] POST /api/login
```

## 🔧 Development

To run in development mode with auto-reload:
```bash
npm run dev
```

## 🚀 Deployment

1. Set `NODE_ENV=production` in environment variables
2. Configure production MongoDB and Redis URLs
3. Set secure JWT secrets
4. Configure production CORS origins
5. Deploy to your hosting platform (Render, Railway, Heroku, etc.)

## 📄 License

ISC

## 👥 Support

For issues or questions, please contact the development team.
