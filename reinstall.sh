#!/bin/bash
set -e

echo "Cleaning project..."
rm -rf node_modules package-lock.json
rm -rf server/node_modules server/package-lock.json

echo "Installing root dependencies..."
npm install

echo "Installing server dependencies..."
cd server
npm install
cd ..

echo "Done! try ./start.sh now"
