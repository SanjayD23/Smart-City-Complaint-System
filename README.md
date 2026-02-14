# 🏙️ Smart City Complaint Management System

A full-stack web application for managing municipal complaints with role-based access control, real-time tracking, and automated email notifications.

## ✨ Features

- **👥 Citizens**: Submit complaints with photos and location, track status in real-time
- **👨‍💼 Admins**: Assign complaints to departments, monitor resolution statistics
- **👷 Officers**: Update complaint status, add comments, resolve issues
- **📧 Automated Emails**: Notifications at every step of the complaint lifecycle
- **🗺️ Google Maps**: Interactive location selection for complaints
- **📸 Image Upload**: Attach photos as evidence

## 🛠️ Tech Stack

**Backend**: Node.js, Express, TypeScript, PostgreSQL, JWT, Bcrypt, Multer, Nodemailer  
**Frontend**: HTML5, CSS3, JavaScript, Google Maps API  
**Deployment**: Railway (Backend + DB), Vercel (Frontend)

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- PostgreSQL v14+
- Google Maps API key
- Email service (Mailtrap/SendGrid)

### Local Setup

1. **Clone the repository**
```bash
git clone https://github.com/SanjayD23/Smart-City-Complaint-System.git
cd Smart-City-Complaint-System
```

2. **Backend Setup**
```bash
cd backend
npm install
```

Create `.env` file:
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/smart_city_db
JWT_SECRET=your-secret-key
PORT=5000
EMAIL_HOST=sandbox.smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your-mailtrap-user
EMAIL_PASS=your-mailtrap-pass
FRONTEND_URL=http://localhost:3000
```

Start server:
```bash
npm run dev
```

3. **Frontend Setup**

Update `frontend/js/api.js` with your backend URL, then serve the frontend:
```bash
cd frontend
npx live-server
```

## 🌐 Deployment

See [DEPLOY_STEPS.md](DEPLOY_STEPS.md) for detailed deployment instructions.

**Quick Deploy:**
1. **Railway**: Backend + PostgreSQL
2. **Vercel**: Frontend
3. **Mailtrap**: Email testing
4. **Google Cloud**: Maps API

## 📱 Default Admin Account

- **Email**: `admin@smartcity.com`
- **Password**: `admin123`

⚠️ Change this immediately after first login!

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user

### Complaints
- `POST /api/complaints` - Create complaint (Citizen)
- `GET /api/complaints` - Get complaints (role-filtered)
- `PUT /api/complaints/:id/assign` - Assign to department (Admin)
- `PUT /api/complaints/:id/status` - Update status (Officer)

### Departments
- `GET /api/departments` - List all departments
- `POST /api/departments` - Create department (Admin)

## 📄 License

MIT License - Free to use for learning and production

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a pull request.

---

Built with ❤️ for Smart Cities
