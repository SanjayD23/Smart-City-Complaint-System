# 🏙️ Smart City Complaint Management System

A full-stack web application for managing municipal complaints with role-based access control, real-time tracking, and automated email notifications.

## ✨ Features

### 👥 For Citizens
- Register and login to the system
- Submit complaints with photos and location (Google Maps)
- Track complaint status in real-time
- Receive email notifications on status updates

### 👨‍💼 For Administrators
- View all complaints in the system
- Assign complaints to departments
- Assign specific officers to complaints
- Monitor resolution statistics

### 👷 For Department Officers
- View assigned complaints
- Update complaint status (Pending → In Progress → Resolved)
- Add comments and updates
- Automatic email notifications to citizens

## 🛠️ Tech Stack

### Backend
- **Node.js** with **Express**
- **TypeScript** for type safety
- **PostgreSQL** database
- **JWT** authentication
- **Bcrypt** for password hashing
- **Multer** for file uploads
- **Nodemailer** for email notifications

### Frontend
- **HTML5** for structure
- **CSS3** with modern design (gradients, glassmorphism, animations)
- **Vanilla JavaScript** for interactivity
- **Google Maps API** for location selection

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- Google Maps API key
- Email service credentials (Mailtrap for testing)

## 🚀 Local Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd "Smart City complaint System"
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/smart_city_db
JWT_SECRET=your-super-secret-jwt-key-change-this
PORT=5000
NODE_ENV=development

# Email Configuration (Mailtrap for testing)
EMAIL_HOST=sandbox.smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your-mailtrap-username
EMAIL_PASS=your-mailtrap-password
EMAIL_FROM=noreply@smartcity.com

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 3. Database Setup

Make sure PostgreSQL is running, then:

```bash
# The database tables will be created automatically when you start the server
npm run dev
```

### 4. Frontend Setup

Update the API base URL in `frontend/js/api.js`:

```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

Add your Google Maps API key in `frontend/citizen-dashboard.html`:

```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY"></script>
```

Serve the frontend using any static server:

```bash
cd frontend
npx live-server
```

Or use VS Code Live Server extension.

## 🌐 Deployment

### Backend Deployment (Railway/Render)

1. **Create a PostgreSQL database** on Railway or Render
2. **Deploy the backend**:
   - Connect your GitHub repository
   - Set environment variables in the platform dashboard
   - Deploy from the `backend` directory

### Frontend Deployment (Vercel/Netlify)

1. **Update API URL** in `frontend/js/api.js` to your deployed backend URL
2. **Deploy to Vercel/Netlify**:
   - Connect your GitHub repository
   - Set build directory to `frontend`
   - Deploy

### Environment Variables for Production

Make sure to set these in your deployment platform:

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Strong random secret
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS` - Production email service
- `FRONTEND_URL` - Your deployed frontend URL
- `NODE_ENV=production`

## 📧 Email Configuration

### For Testing (Mailtrap)
1. Sign up at [mailtrap.io](https://mailtrap.io)
2. Get SMTP credentials from your inbox
3. Add to `.env` file

### For Production
Use one of these services:
- **SendGrid** (100 emails/day free)
- **Mailgun** (5,000 emails/month free)
- **AWS SES** (pay-as-you-go)

## 🗺️ Google Maps Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable **Maps JavaScript API**
4. Create API credentials
5. Add the API key to `citizen-dashboard.html`

## 📱 Default Admin Account

After running the migration, a default admin account is created:

- **Email**: admin@smartcity.com
- **Password**: admin123

⚠️ **Change this password immediately in production!**

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Complaints
- `POST /api/complaints` - Create complaint (Citizen)
- `GET /api/complaints` - Get complaints (filtered by role)
- `GET /api/complaints/:id` - Get complaint details
- `PUT /api/complaints/:id/assign` - Assign complaint (Admin)
- `PUT /api/complaints/:id/status` - Update status (Officer)

### Departments
- `GET /api/departments` - Get all departments
- `POST /api/departments` - Create department (Admin)
- `GET /api/departments/:id/officers` - Get officers by department

## 🎨 Features Highlights

- **Modern UI** with gradients, smooth animations, and responsive design
- **Role-based access control** for different user types
- **Real-time complaint tracking** with status updates
- **Automated email notifications** at every step
- **Image upload** for complaint evidence
- **Google Maps integration** for precise location selection
- **Statistics dashboard** for admins and officers

## 📄 License

MIT License - feel free to use this project for learning or production!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ for Smart Cities
