# Job Portal - Application Startup Guide

## Prerequisites

Before running the application, ensure you have:
- Node.js (v18 or higher)
- npm (v8 or higher)
- MongoDB (either local or MongoDB Atlas cloud)
- Optional: Docker & Docker Compose (recommended for easy setup)

## Quick Start

### Option 1: Using Docker Compose (Recommended)

Docker Compose will automatically start MongoDB and all services.

```bash
cd "d:\Job Portal"
docker-compose up --build
```

**Access the application:**
- Frontend: http://localhost:5173
- API Gateway: http://localhost:5000
- MongoDB: localhost:27017

### Option 2: Using Windows Batch Script

Run the startup script (automatically handles port cleanup and MongoDB check):

```bash
cd "d:\Job Portal"
START_APP.bat
```

### Option 3: Manual Startup

#### Step 1: Start MongoDB

**If you have MongoDB installed locally:**
```bash
mongod
```

**If you don't have MongoDB installed, use MongoDB Atlas:**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get your connection string
4. Update the `MONGO_URI` in `.env` file:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/job_portal_db
   ```

#### Step 2: Install Dependencies

```bash
cd "d:\Job Portal"
npm run install:all
```

#### Step 3: Start the Application

```bash
npm run dev
```

**Expected Output:**
```
[0] 🔐 Auth Service running on port 5001
[1] 👥 User Service running on port 5002
[2] 💼 Job Service running on port 5003
[3] 📋 Application Service running on port 5004
[4] 🔍 Search Service running on port 5005
[5] 🔔 Notification Service running on port 5006
[6] ⚙️ Admin Service running on port 5007
[7] 🚀 API Gateway running on port 5000
[8] Local:   http://localhost:5173/
```

## Available Commands

### Development
```bash
npm run dev              # Run all services and client
npm run dev:client      # Run only frontend
npm run dev:gateway     # Run only API Gateway
npm run dev:auth        # Run only Auth Service
npm run dev:user        # Run only User Service
npm run dev:job         # Run only Job Service
npm run dev:application # Run only Application Service
npm run dev:search      # Run only Search Service
npm run dev:notification # Run only Notification Service
npm run dev:admin       # Run only Admin Service
```

### Testing
```bash
npm test                # Run all tests
npm run test:all        # Run all tests concurrently
npm run test:client     # Run frontend tests
npm run test:gateway    # Run gateway tests
npm run test:services   # Run all backend services tests
```

### Docker
```bash
npm run docker:up       # Start with Docker Compose
npm run docker:down     # Stop Docker Compose services
```

## Troubleshooting

### Issue: "address already in use" on port 5000-5007

**Solution:** Kill the existing process using that port:
```bash
REM Find and kill process on specific port (example: 5000)
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

Or run the batch script which does this automatically:
```bash
START_APP.bat
```

### Issue: MongoDB Connection Error

**Error:** `The 'uri' parameter to 'openUri()' must be a string, got 'undefined'`

**Solutions:**
1. **Ensure MongoDB is running locally:**
   ```bash
   mongod
   ```

2. **Or use MongoDB Atlas (Cloud):**
   - Create free account at https://www.mongodb.com/cloud/atlas
   - Get connection string from cluster
   - Update `.env` file:
     ```
     MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/job_portal_db
     ```

3. **Verify .env file exists:**
   - Check that `.env` file is in the root directory: `d:\Job Portal\.env`
   - Verify `MONGO_URI` is defined

### Issue: Port Already in Use

If multiple instances are running:
```bash
# Power shell command to kill all Node processes
Get-Process node | Stop-Process -Force

# Or for specific ports
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Issue: Dependencies not installed

```bash
# Clean install
npm run install:all

# Or individual services
npm install --prefix frontend/client
npm install --prefix backend/gateway
npm install --prefix backend/services/auth-service
# ... repeat for other services
```

## Environment Variables

The `.env` file in the root directory contains all necessary configurations:

```
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/job_portal_db

# Port Configuration
GATEWAY_PORT=5000
AUTH_SERVICE_PORT=5001
USER_SERVICE_PORT=5002
JOB_SERVICE_PORT=5003
APPLICATION_SERVICE_PORT=5004
SEARCH_SERVICE_PORT=5005
NOTIFICATION_SERVICE_PORT=5006
ADMIN_SERVICE_PORT=5007

# JWT Secrets
JWT_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_secret

# OAuth Credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Other Services
REDIS_URL=redis://localhost:6379
CLIENT_URL=http://localhost:5173
```

## Project Structure

```
Job Portal/
├── frontend/
│   └── client/          # React/Vite frontend application
├── backend/
│   ├── docker/          # Docker configuration files
│   ├── gateway/         # API Gateway (Express)
│   ├── services/        # Microservices
│   │   ├── auth-service/
│   │   ├── user-service/
│   │   ├── job-service/
│   │   ├── application-service/
│   │   ├── search-service/
│   │   ├── notification-service/
│   │   └── admin-service/
│   └── shared/          # Shared utilities and middleware
├── docker-compose.yml   # Docker Compose configuration
├── package.json         # Root package.json with scripts
├── .env                 # Environment variables
└── START_APP.bat        # Windows startup script
```

## Additional Resources

- Frontend Docs: `frontend/client/README.md`
- Backend Docs: Check individual service folders
- API Documentation: Available at http://localhost:5000/api-docs

## Support

For issues or questions, please:
1. Check the troubleshooting section above
2. Review the Git repository: https://github.com/AreenSharma8/Job-Portal-Team
3. Check service logs in the terminal output
