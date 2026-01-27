# 🚀 How to Access Your Project

## ✅ Server Status
Your development server is **RUNNING** on port **5173**

## 🌐 Access the Application

### Option 1: Direct URL
Open your browser and go to:
```
http://localhost:5173
```

### Option 2: If localhost doesn't work
Try:
```
http://127.0.0.1:5173
```

## 🎯 What You Should See

When you open the application, you should see:

1. **QR Scanner Page** (Default - User Session)
   - A QR code scanner interface
   - Options to scan via camera, upload image, or enter ticket ID manually
   - "Admin" button in the top right

2. **After Scanning/Entering Ticket**:
   - Recommended routes to stadium gates
   - AI chatbot for FAQs
   - Interactive map showing your location and recommended path

## 🔐 Admin Access

To access the admin dashboard:
1. Click the **"Admin"** button on the user session page, OR
2. Go directly to: `http://localhost:5173/admin/login`
3. Login credentials:
   - **Username**: `admin`
   - **Password**: `afcon2025`

## 🐛 Troubleshooting

### If you see a blank page:

1. **Open Browser Developer Tools** (Press F12)
2. Check the **Console** tab for any red error messages
3. Check the **Network** tab - make sure files are loading (status 200)

### If the page doesn't load:

1. **Check if server is running**:
   - Look at your terminal/PowerShell
   - You should see: `VITE v5.x.x  ready in xxx ms`
   - And: `➜  Local:   http://localhost:5173/`

2. **Restart the server**:
   - Press `Ctrl+C` in the terminal to stop
   - Run: `npm run dev`
   - Wait for it to start

3. **Clear browser cache**:
   - Press `Ctrl+Shift+R` (hard refresh)
   - Or clear cache in browser settings

### If you see "Connection Refused":

- The server might have stopped
- Restart it with: `npm run dev`
- Make sure no other application is using port 5173

## 📱 Testing QR Scanner

You can test the QR scanner by:
1. **Camera**: Allow camera permissions when prompted
2. **Upload Image**: Upload any QR code image
3. **Manual Entry**: Enter any ticket ID (e.g., `TICKET123`)

## 🎨 Features Available

- ✅ QR Code Scanning (Camera/Image/Manual)
- ✅ Route Recommendations (Shortest Path Algorithm)
- ✅ AI Chatbot for FAQs
- ✅ Interactive Map (Morocco Stadium)
- ✅ Real-time Crowd Flow Simulation (Admin)
- ✅ AI Model Predictions (Admin)
- ✅ Professional AFCON Morocco Theme

---

**Current Server Port**: 5173  
**Status**: ✅ Running  
**Last Updated**: 2024
