# 🚀 Crowd Flow Commander - Setup & Run Guide

## ✅ Quick Start

### Option 1: Use the Batch File (Easiest)
1. Double-click `START_SERVER.bat`
2. Wait for the server to start
3. Open your browser to: `http://localhost:8080`

### Option 2: Manual Start

1. **Open Terminal/PowerShell** in this folder

2. **Install Dependencies** (first time only):
   ```bash
   npm install
   ```

3. **Start the Server**:
   ```bash
   npm run dev
   ```

4. **Open Browser**:
   - Go to: `http://localhost:8080`
   - Or: `http://127.0.0.1:8080`

## 🎯 What You'll See

- **Dashboard**: Real-time stadium visualization
- **Smart Ticket**: Dynamic ticket system
- **Analytics**: Performance charts
- **AI Model**: LSTM neural network predictions

## 🔧 Troubleshooting

### "Connection Failed" Error

**Solution 1: Check if server is running**
- Look at your terminal - you should see:
  ```
  VITE v5.x.x  ready in xxx ms
  ➜  Local:   http://localhost:8080/
  ```

**Solution 2: Port might be in use**
- Stop the server (Ctrl+C)
- Try a different port:
  ```bash
  npm run dev -- --port 3000
  ```
- Then go to: `http://localhost:3000`

**Solution 3: Kill existing processes**
```bash
# In PowerShell:
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force
```

### Blank Page

1. **Open Browser Developer Tools** (F12)
2. Check **Console** tab for errors
3. Check **Network** tab - files should load (status 200)

### Compilation Errors

1. **Clear cache and reinstall**:
   ```bash
   rm -rf node_modules
   npm install
   ```

2. **Check Node.js version**:
   ```bash
   node --version
   ```
   Should be v16 or higher

## 📦 Requirements

- **Node.js**: v16 or higher ([Download](https://nodejs.org/))
- **npm**: Comes with Node.js
- **Modern Browser**: Chrome, Firefox, Edge, Safari

## 🎨 Features

- ✅ Real TensorFlow.js LSTM Model
- ✅ Professional UI with animations
- ✅ Real-time crowd flow simulation
- ✅ AI-powered predictions
- ✅ Responsive design

## 🛠️ Available Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Check code quality

## 💡 Tips

- The AI model initializes automatically (may take a few seconds)
- If TensorFlow.js fails to load, the app uses a statistical fallback
- All predictions work in real-time
- Model trains automatically as data is collected

## 🆘 Still Having Issues?

1. Make sure you're in the correct directory
2. Check that Node.js is installed: `node --version`
3. Try deleting `node_modules` and running `npm install` again
4. Check the terminal for specific error messages

---

**Enjoy your Crowd Flow Commander! 🎉**

