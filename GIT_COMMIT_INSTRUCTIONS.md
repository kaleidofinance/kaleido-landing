# Git Commit Instructions

## Summary of Changes

### New Files:
- `src/components/DemoModal.tsx` - Demo modal component with screenshot support
- `public/demo-screens/` - Directory with demo screenshots (dashboard.png, marketplace.png, stablecoin.png, swap.png, staking.png)

### Modified Files:
- `src/components/Hero.tsx` - Added demo modal integration with "Watch Demo" button
- `package.json` - Removed capture-screenshots script

## Commands to Run

Open your terminal and run:

```bash
cd /Users/macking/Downloads/kaleido/FrontPage-twitter2

# Check what files have changed
git status

# Add all changes
git add .

# Commit with message
git commit -m "feat: Add demo modal with screenshot support for Kaleido UI preview

- Added DemoModal component with 5 demo screens (Dashboard, Marketplace, Stablecoin, Swap, Staking)
- Integrated demo modal into Hero section with 'Watch Demo' button
- Support for screenshots from public/demo-screens/ directory
- Fallback to mockup content if screenshots are not available
- Smooth animations and transitions between screens
- Navigation tabs and pagination controls
- CTA button to open live DApp"

# Push to branch
git push origin new-frontpage
```

## Alternative: Use the Script

Or run the provided script:

```bash
cd /Users/macking/Downloads/kaleido/FrontPage-twitter2
bash commit-and-push.sh
```

## Verify

After pushing, verify the changes on GitHub:
- Check that `src/components/DemoModal.tsx` is added
- Check that `src/components/Hero.tsx` has the demo modal integration
- Check that screenshots are in `public/demo-screens/`

