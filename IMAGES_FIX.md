# Images Not Displaying on Vercel - Fix Guide

## Problem

Images in `src/images/` are very large and may not display properly on Vercel:
- `tokyo.jpg` - 21.13 MB
- `paris.jpg` - 11.15 MB  
- `santorini.jpg` - 9.39 MB
- Video file - 81.43 MB (already excluded)

## Solutions

### Option 1: Optimize Images Locally (Recommended)

Use image optimization tools to reduce file sizes:

**Using ImageMagick:**
```bash
# Install ImageMagick
winget install ImageMagick.ImageMagick

# Optimize images (reduce to 85% quality, max width 1920px)
magick src/images/tokyo.jpg -quality 85 -resize 1920x1920> src/images/tokyo-optimized.jpg
magick src/images/paris.jpg -quality 85 -resize 1920x1920> src/images/paris-optimized.jpg
magick src/images/santorini.jpg -quality 85 -resize 1920x1920> src/images/santorini-optimized.jpg
```

**Using Online Tools:**
- TinyPNG: https://tinypng.com/
- Squoosh: https://squoosh.app/
- Compressor.io: https://compressor.io/

Target size: **< 500 KB per image**

### Option 2: Use Cloudinary CDN (Best for Production)

**Setup:**
1. Create free account: https://cloudinary.com/
2. Upload images to Cloudinary
3. Get optimized URLs
4. Update image references in code

**Benefits:**
- Automatic optimization
- Responsive images
- Fast global CDN
- No impact on Vercel deployment size

**Example:**
```javascript
// Before
<img src="/src/images/paris.jpg" />

// After (Cloudinary)
<img src="https://res.cloudinary.com/your-cloud/image/upload/c_scale,w_1920,q_auto/paris.jpg" />
```

### Option 3: Use Vercel Image Optimization

Update your code to use Next.js Image component or Vite image optimization:

**Install vite-imagetools:**
```bash
npm install vite-imagetools --save-dev
```

**Update vite.config.js:**
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { imagetools } from 'vite-imagetools'

export default defineConfig({
  plugins: [
    react(),
    imagetools()
  ],
  // ... rest of config
})
```

**Use in code:**
```javascript
import parisImg from './images/paris.jpg?w=1920&format=webp&quality=85'
```

### Option 4: Store Large Media Externally

For the video and very large images:

**Free Options:**
- **GitHub Releases** - Attach files to a release
- **Cloudinary** - 25GB free storage
- **AWS S3** - Pay as you go
- **Bunny CDN** - Affordable CDN

**Update references:**
```javascript
// Video
const videoUrl = 'https://github.com/IDD-NAJ/Veloura-Hospitality-sb/releases/download/v1.0/video.mp4'

// Or use Cloudinary
const videoUrl = 'https://res.cloudinary.com/your-cloud/video/upload/receptionist.mp4'
```

## Quick Fix for Now

### Step 1: Add placeholder images

Create smaller placeholder images or use external URLs temporarily:

```javascript
// In your component
const images = {
  paris: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1920',
  tokyo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1920',
  santorini: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1920'
}
```

### Step 2: Update .gitignore to exclude large images

Already done - large video files are excluded.

### Step 3: Optimize and re-add images

After optimizing images to < 500KB each:
```bash
git add src/images/*.jpg
git commit -m "Add optimized images"
git push
```

## Vercel Deployment Limits

- **Free Plan:** 100 MB per deployment
- **Pro Plan:** 500 MB per deployment

Your current images (41+ MB) are within limits but will slow down:
- Build times
- Page load speeds
- User experience

## Recommended Action Plan

1. **Immediate:** Use Cloudinary or optimize images locally
2. **Short-term:** Implement vite-imagetools for automatic optimization
3. **Long-term:** Use CDN for all media assets

## Testing After Fix

1. Deploy to Vercel
2. Check browser DevTools Network tab
3. Verify images load quickly (< 2 seconds)
4. Check Lighthouse score for performance

---

**Status:** Images are in repository but too large for optimal performance.
**Action Required:** Optimize images or use CDN before production deployment.
