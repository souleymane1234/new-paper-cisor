#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Starting production build...');

try {
  // Set production environment
  process.env.NODE_ENV = 'production';
  process.env.GENERATE_SOURCEMAP = 'false';
  process.env.REACT_APP_ENV = 'production';

  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  console.log('🔨 Building for production...');
  execSync('npm run build', { stdio: 'inherit' });

  // Check if build directory exists
  if (fs.existsSync('./build')) {
    console.log('✅ Production build successful!');
    console.log('📁 Build directory created at: ./build');
    
    // List build contents
    const buildContents = fs.readdirSync('./build');
    console.log('📋 Build contents:', buildContents);
  } else {
    console.error('❌ Build directory not found!');
    process.exit(1);
  }

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
