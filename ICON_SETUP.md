# PWA Icon Setup Guide

## Quick Setup

The PWA requires icon files (`icon-192.png` and `icon-512.png`) in the `public` folder.

## Option 1: Use the SVG Icon (Recommended)

An SVG icon has been created at `public/icon.svg`. You can convert it to PNG using:

### Using Online Tools:
1. Go to https://cloudconvert.com/svg-to-png or similar
2. Upload `public/icon.svg`
3. Set size to 192x192 for first icon, 512x512 for second
4. Download and save as `icon-192.png` and `icon-512.png` in `public` folder

### Using Node.js Script:
```bash
npm install sharp
node scripts/generate-icons.js
```

## Option 2: Create Custom Icons

Create your own icons:
- **icon-192.png**: 192x192 pixels
- **icon-512.png**: 512x512 pixels

Place them in the `public` folder.

## Option 3: Use Placeholder Icons

For development, you can use any 192x192 and 512x512 PNG images temporarily.

## Icon Design Tips

- Use your brand colors (currently using gradient: #ff006e to #8338ec)
- Keep design simple and recognizable at small sizes
- Ensure good contrast
- Use rounded corners (80px radius recommended)

## Verification

After adding icons, check:
1. `public/icon-192.png` exists
2. `public/icon-512.png` exists
3. Icons are referenced in `public/manifest.json`
4. Icons are referenced in `index.html`

The PWA will work without icons, but they're required for proper app installation experience.

