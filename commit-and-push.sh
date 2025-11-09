#!/bin/bash

# Commit and push changes to new-frontpage branch

cd "$(dirname "$0")"

echo "🔄 Checking git status..."
git status

echo ""
echo "📦 Adding all changes..."
git add .

echo ""
echo "💾 Committing changes..."
git commit -m "feat: Add demo modal with screenshot support for Kaleido UI preview

- Added DemoModal component with 5 demo screens (Dashboard, Marketplace, Stablecoin, Swap, Staking)
- Integrated demo modal into Hero section with 'Watch Demo' button
- Support for screenshots from public/demo-screens/ directory
- Fallback to mockup content if screenshots are not available
- Smooth animations and transitions between screens
- Navigation tabs and pagination controls
- CTA button to open live DApp"

echo ""
echo "🚀 Pushing to new-frontpage branch..."
git push origin new-frontpage

echo ""
echo "✅ Done! Changes have been pushed to new-frontpage branch."

