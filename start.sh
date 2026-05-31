#!/bin/bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "🚀 Starting SignalFlow..."

# Backend
cd "$ROOT/backend_local"
if [ ! -d venv ]; then
  python3 -m venv venv
  venv/bin/pip install -r requirements.txt -q
fi
venv/bin/uvicorn main:app --port 8000 --reload &
BACKEND_PID=$!
echo "✅ Backend running at http://localhost:8000  (PID $BACKEND_PID)"

# Frontend
cd "$ROOT/frontend"
if [ ! -d node_modules ]; then
  npm install -q
fi
npm run dev -- --port 5173 &
FRONTEND_PID=$!
echo "✅ Frontend running at http://localhost:5173  (PID $FRONTEND_PID)"

echo ""
echo "Open http://localhost:5173 in your browser."
echo "Press Ctrl+C to stop both servers."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT INT TERM
wait
