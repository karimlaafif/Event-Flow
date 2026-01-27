# 🗺️ Google Maps API Setup Guide

## Overview
The application now uses Google Maps API with an automatic fallback to an Agadir map image if the API fails or is unavailable.

## Setup Instructions

### Step 1: Get a Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Maps JavaScript API**
   - **Geocoding API** (optional, for address lookups)
4. Go to **Credentials** → **Create Credentials** → **API Key**
5. Copy your API key

### Step 2: Add API Key to Your Project

Create a `.env` file in the root directory of your project:

```env
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

**Important:** 
- Never commit the `.env` file to version control
- The `.env` file is already in `.gitignore`
- Restart your dev server after adding the API key

### Step 3: Restrict Your API Key (Recommended)

For security, restrict your API key:

1. Go to **Credentials** in Google Cloud Console
2. Click on your API key
3. Under **API restrictions**, select **Restrict key**
4. Choose **Maps JavaScript API**
5. Under **Application restrictions**, you can:
   - Restrict to specific HTTP referrers (for web)
   - Restrict to specific IP addresses (for server-side)

### Step 4: Test the Map

1. Start your dev server: `npm run dev`
2. Navigate to the user session or admin tracking page
3. The map should load with Google Maps
4. If the API key is missing or invalid, you'll see the Agadir map fallback

## Fallback Behavior

If Google Maps API fails or is unavailable, the application automatically shows:
- A static image of Agadir Stadium area
- Overlay markers showing gate locations
- User location indicator
- A notification explaining the fallback mode

## Features

✅ **Interactive Google Maps** - Full zoom, pan, and marker interactions
✅ **Gate Markers** - Color-coded by status (green/yellow/orange/red)
✅ **User Tracking** - Real-time user markers for admin view
✅ **Route Visualization** - Green polyline showing recommended path
✅ **Info Windows** - Click markers to see details
✅ **Automatic Fallback** - Graceful degradation to static map

## Troubleshooting

### Map Not Showing
- Check browser console for errors
- Verify API key is correct in `.env` file
- Ensure Maps JavaScript API is enabled
- Check API key restrictions

### Fallback Always Showing
- API key might be invalid or restricted
- Check browser console for specific error messages
- Verify billing is enabled on Google Cloud project

### Map Loads Slowly
- This is normal on first load
- Subsequent loads are cached
- Consider using a CDN or optimizing API key restrictions

## Cost Considerations

Google Maps JavaScript API has a free tier:
- **$200 free credit per month**
- First 28,000 map loads per month are free
- After that: $7 per 1,000 additional loads

For development and small projects, the free tier is usually sufficient.

