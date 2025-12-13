#!/usr/bin/env node

/**
 * Helper script to get Vercel credentials for GitHub Actions setup
 * 
 * Usage:
 *   node scripts/get-vercel-credentials.js
 * 
 * This script will help you find:
 * - VERCEL_ORG_ID
 * - VERCEL_PROJECT_ID
 * - Instructions for getting VERCEL_TOKEN
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('\n🔍 Vercel Credentials Helper\n');
console.log('=' .repeat(50));

// Check for .vercel directory
const vercelDir = join(projectRoot, '.vercel');
const projectJson = join(vercelDir, 'project.json');

if (existsSync(projectJson)) {
  try {
    const projectData = JSON.parse(readFileSync(projectJson, 'utf-8'));
    
    console.log('\n✅ Found Vercel project configuration!\n');
    console.log('📋 Your Vercel Credentials:\n');
    console.log(`   VERCEL_ORG_ID: ${projectData.orgId || 'Not found'}`);
    console.log(`   VERCEL_PROJECT_ID: ${projectData.projectId || 'Not found'}`);
    console.log('\n' + '='.repeat(50));
    console.log('\n📝 Next Steps:\n');
    console.log('1. Get your VERCEL_TOKEN:');
    console.log('   → Go to: https://vercel.com/account/tokens');
    console.log('   → Click "Create Token"');
    console.log('   → Copy the token\n');
    console.log('2. Add these secrets to GitHub:');
    console.log('   → Go to: Settings > Secrets and variables > Actions');
    console.log('   → Add each secret:\n');
    console.log(`      VERCEL_ORG_ID = ${projectData.orgId || 'YOUR_ORG_ID'}`);
    console.log(`      VERCEL_PROJECT_ID = ${projectData.projectId || 'YOUR_PROJECT_ID'}`);
    console.log('      VERCEL_TOKEN = (from step 1)');
    console.log('\n' + '='.repeat(50) + '\n');
    
  } catch (error) {
    console.error('❌ Error reading project.json:', error.message);
    console.log('\n💡 Try running: vercel link');
  }
} else {
  console.log('❌ .vercel directory not found!\n');
  console.log('💡 To set up Vercel project:\n');
  console.log('   1. Install Vercel CLI: npm i -g vercel');
  console.log('   2. Login: vercel login');
  console.log('   3. Link project: vercel link');
  console.log('   4. Run this script again\n');
  console.log('='.repeat(50) + '\n');
  process.exit(1);
}

