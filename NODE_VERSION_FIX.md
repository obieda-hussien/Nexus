# Node.js Version Compatibility

This project has been configured to work with Node.js 16.20.2+ for maximum compatibility.

## Quick Fix for Node.js Version Issues

If you encounter the error:
```
You are using Node.js 16.20.2. Vite requires Node.js version 20.19+ or 22.12+
```

This has been **fixed** by downgrading Vite to version 4.5.3 which supports Node.js 16+.

## Setup Instructions

1. **Use the correct Node.js version** (if you have nvm installed):
   ```bash
   nvm use
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

## Alternative: Upgrade Node.js (if preferred)

If you prefer to use a newer Node.js version:

1. **Install Node.js 20+ or 22+** from [nodejs.org](https://nodejs.org/)
2. Or use nvm:
   ```bash
   nvm install 20
   nvm use 20
   ```

## Supported Versions

- **Node.js**: 16.20.0+
- **npm**: 8.0.0+
- **Vite**: 4.5.3 (compatible with Node.js 16+)