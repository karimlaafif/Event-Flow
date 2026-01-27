# 🗺️ Agadir Map Image Setup

## How to Add Your Agadir Map Image

The application is configured to use an actual satellite map image of the Agadir Stadium area showing:
- **Adrar Stadium** (circular structure in center)
- **N1 Road** (main green road)
- **Rocade Nord-Est** (road to the east)
- **Neighborhoods**: CITÉ AL MOHAMMADI, BOUARGANE, CITÉ DAKHLA
- **Landmarks**: McDonald's, Karting Agadir, Hospital

## Steps to Add Your Map Image:

1. **Save your map image** as `agadir-map.jpg` (or `.png`)
2. **Place it in the `public` folder** of your project:
   ```
   public/
     └── agadir-map.jpg
   ```
3. **The image will automatically be used** as the fallback map

## Image Requirements:

- **Format**: JPG or PNG
- **Recommended Size**: 1200x800 pixels or larger
- **Aspect Ratio**: 3:2 (width:height)
- **File Name**: `agadir-map.jpg` or `agadir-map.png`

## Current Behavior:

- If `agadir-map.jpg` exists in `/public`, it will be used
- If the image fails to load, a detailed SVG placeholder will be shown
- The placeholder shows the stadium area layout with roads and neighborhoods

## Alternative: Use Online Image URL

If you prefer to host the image online, you can update the `AGADIR_MAP_IMAGE` constant in:
`src/components/GoogleMapWithFallback.tsx`

Change:
```typescript
const AGADIR_MAP_IMAGE = '/agadir-map.jpg';
```

To:
```typescript
const AGADIR_MAP_IMAGE = 'https://your-image-host.com/agadir-map.jpg';
```

