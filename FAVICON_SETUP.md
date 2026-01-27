# 🎯 Favicon Setup Instructions

## How to Add Your Favicon

The HTML is now configured to use your favicon. Follow these steps:

### Step 1: Prepare Your Favicon Image

You need to create favicon files from your "TE" logo image:

**Required Sizes:**
- `favicon.ico` - 32x32 pixels (main favicon)
- `favicon-16x16.png` - 16x16 pixels
- `favicon-32x32.png` - 32x32 pixels
- `apple-touch-icon.png` - 180x180 pixels (for iOS devices)
- `og-image.png` - 1200x630 pixels (for social media sharing)

### Step 2: Convert Your Image

**Option A: Online Tools**
1. Go to https://favicon.io/favicon-converter/
2. Upload your "TE" logo image
3. Download the generated favicon files
4. Place them in the `public` folder

**Option B: Manual Creation**
1. Use an image editor (Photoshop, GIMP, Canva)
2. Create square versions of your "TE" logo
3. Export in the required sizes
4. Save as PNG files (except favicon.ico)

### Step 3: Place Files in Public Folder

Put all favicon files in the `public` folder:

```
public/
  ├── favicon.ico
  ├── favicon-16x16.png
  ├── favicon-32x32.png
  ├── apple-touch-icon.png
  ├── og-image.png
  └── site.webmanifest (optional)
```

### Step 4: Create site.webmanifest (Optional)

Create `public/site.webmanifest`:

```json
{
  "name": "Event Flow",
  "short_name": "Event Flow",
  "description": "AI-Powered Stadium Management for AFCON 2025",
  "icons": [
    {
      "src": "/favicon-16x16.png",
      "sizes": "16x16",
      "type": "image/png"
    },
    {
      "src": "/favicon-32x32.png",
      "sizes": "32x32",
      "type": "image/png"
    },
    {
      "src": "/apple-touch-icon.png",
      "sizes": "180x180",
      "type": "image/png"
    }
  ],
  "theme_color": "#DC2626",
  "background_color": "#1f2937",
  "display": "standalone"
}
```

### Step 5: Test

1. Restart your dev server
2. Clear browser cache (Ctrl+Shift+R)
3. Check the browser tab - you should see your favicon!

## Quick Setup (If You Have the Image Ready)

If you already have your "TE" logo image:

1. **Save your image** as `te-logo.png` in the `public` folder
2. **Use an online converter:**
   - Visit: https://favicon.io/favicon-converter/
   - Upload `public/te-logo.png`
   - Download the generated files
   - Extract and place all files in `public` folder
3. **Rename files** to match the names in `index.html`:
   - `favicon.ico` (already correct)
   - `favicon-16x16.png`
   - `favicon-32x32.png`
   - `apple-touch-icon.png`
   - `og-image.png` (for social sharing)

## Current Setup

The `index.html` file is already configured with:
- ✅ Favicon links for all sizes
- ✅ Apple touch icon for iOS
- ✅ Open Graph tags for social sharing
- ✅ Twitter card tags

Just add your image files and they'll work automatically!

## Design Tips for Favicon

- **Keep it simple:** The "TE" logo should be recognizable at 16x16 pixels
- **High contrast:** Use colors that stand out (red/green theme)
- **Square format:** Favicons work best as squares
- **No text:** Avoid small text that won't be readable
- **Bold design:** Simple, bold shapes work best at small sizes

## Troubleshooting

**Favicon not showing?**
1. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
2. Check browser console for 404 errors
3. Verify file names match exactly (case-sensitive)
4. Restart dev server

**Still not working?**
- Check that files are in `public` folder (not `src`)
- Verify file paths in `index.html` start with `/`
- Try hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)

