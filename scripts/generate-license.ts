#!/usr/bin/env ts-node
/**
 * License key generator for OwnYourWebsite.app
 * Usage: npx ts-node scripts/generate-license.ts <orderId>
 * Example: npx ts-node scripts/generate-license.ts order_12345
 */

import { createHmac } from 'crypto'

const LICENSE_SECRET = process.env.LICENSE_SECRET || 'dev-secret-change-in-production'
const PRODUCT_ID = 'cleaning-service-pro-v1'

function generateLicenseKey(orderId: string): string {
  const hmac = createHmac('sha256', LICENSE_SECRET)
  hmac.update(`${PRODUCT_ID}:${orderId}`)
  const hash = hmac.digest('hex').toUpperCase()
  return `CLEAN-${hash.slice(0, 8)}-${hash.slice(8, 16)}-${hash.slice(16, 24)}`
}

const orderId = process.argv[2]
if (!orderId) {
  console.error('Usage: npx ts-node scripts/generate-license.ts <orderId>')
  process.exit(1)
}

const key = generateLicenseKey(orderId)
console.log('\n✅ License Key Generated:')
console.log(`\n  ${key}\n`)
console.log(`Order ID: ${orderId}`)
console.log(`Product:  ${PRODUCT_ID}`)
console.log('\nAdd to customer .env:')
console.log(`  LICENSE_KEY=${key}\n`)
