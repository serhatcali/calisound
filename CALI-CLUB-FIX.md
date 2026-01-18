# 🔧 CALI Club Build Fix

## Problem
`BatchedMesh` is not exported from 'three' error - this happens because `@react-three/drei@9.88.0` requires `three@0.160+` which includes `BatchedMesh`.

## Solution Applied
1. ✅ Updated `package.json` to use `three@^0.160.0`
2. ✅ Replaced `Text` component with `Html` component in `Character.tsx` (avoids BatchedMesh dependency)

## Next Steps
Run this command in your terminal:

```bash
cd /Users/serhatcali/Desktop/cali-sound
npm install
```

This will install `three@0.160.0` which includes `BatchedMesh` support.

## Alternative (if npm install fails)
If you have permission issues, try:

```bash
cd /Users/serhatcali/Desktop/cali-sound
rm -rf node_modules package-lock.json
npm install
```

Or use a different package manager:
```bash
yarn install
# or
pnpm install
```

## Verification
After running `npm install`, the build should work. The `Html` component for character names will work the same as `Text` but without requiring `BatchedMesh`.
