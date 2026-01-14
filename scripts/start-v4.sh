#!/bin/bash

echo "🚀 Starting Tailwind CSS v4 Dev Server"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 Location: $(pwd)"
echo "🌿 Branch: $(git branch --show-current)"
echo "📦 Tailwind: v4.1.18"
echo ""
echo "🌐 Access at: https://localhost:5174/crm"
echo ""
echo "💡 To compare with v3, open another terminal and run:"
echo "   cd /Users/salgadom/EACH/each-monorepo/apps/frontend/4prop-crm-react"
echo "   npm run dev:crm"
echo "   (v3 will be at https://localhost:5173/crm)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

PORT=5174 npm run dev:crm
