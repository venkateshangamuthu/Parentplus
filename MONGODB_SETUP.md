# MongoDB Connection Setup Guide

## Files Created

### 1. **db/connection.js** - MongoDB Connection Module
Handles connection to MongoDB with error handling.

### 2. **.env** - Environment Variables
```
MONGODB_URI=mongodb://localhost:27017/parentplus
PORT=5000
NODE_ENV=development
```

### 3. **server.js** - Express Server
Main server file that initializes Express and connects to MongoDB.

### 4. **models/User.js** - Sample Mongoose Model
Example User model showing schema structure.

---

## Setup Instructions

### Option 1: Local MongoDB
1. Install MongoDB Community Edition:
   - Windows: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/
   - Download and install MongoDB Community Server
   
2. Start MongoDB service (Windows):
   ```bash
   # MongoDB should run on localhost:27017 by default
   ```

3. Update `.env` file (use default or custom):
   ```
   MONGODB_URI=mongodb://localhost:27017/parentplus
   ```

### Option 2: MongoDB Atlas (Cloud)
1. Create account: https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string (replace username/password):
   ```
   mongodb+srv://username:password@cluster.mongodb.net/parentplus?retryWrites=true&w=majority
   ```
4. Update `.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/parentplus?retryWrites=true&w=majority
   ```

---

## Running the Application

### Start Backend Server
```bash
npm start          # Production mode
# or
npm run dev       # Development mode with auto-reload
```

The server will connect to MongoDB and run on `http://localhost:5000`

### Start Frontend (in another terminal)
```bash
npm run client
```

This runs the React app on `http://localhost:5173`

---

## Testing the Connection

Once server is running, test with:

```bash
# Health check
curl http://localhost:5000/api/health

# Response:
# {"status":"Server is healthy","timestamp":"2024-..."}
```

---

## Next Steps

1. **Create API Routes**: Add routes in `server.js` to handle CRUD operations
2. **Add User Routes**: 
   ```javascript
   import User from './models/User.js';
   
   app.post('/api/users', async (req, res) => {
     try {
       const user = new User(req.body);
       await user.save();
       res.json(user);
     } catch (error) {
       res.status(400).json({ error: error.message });
     }
   });
   ```

3. **Connect Frontend to Backend**: Update React components to fetch from API

---

## Troubleshooting

### Connection Refused
- Check MongoDB is running
- Verify `MONGODB_URI` in `.env` is correct

### Port Already in Use
- Change `PORT` in `.env` to another value (e.g., 5001)

### Module Not Found
- Run `npm install` to ensure all dependencies are installed

---

For more info: https://mongoose.js.org/docs/
