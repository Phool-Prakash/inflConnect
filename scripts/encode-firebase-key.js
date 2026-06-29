#!/usr/bin/env node
/**
 * Encode Firebase service-account JSON for Vercel.
 * Usage: node scripts/encode-firebase-key.js path/to/serviceAccount.json
 * Paste output into Vercel env: FIREBASE_SERVICE_ACCOUNT_BASE64
 */
const fs = require("fs");
const path = require("path");

const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/encode-firebase-key.js <serviceAccount.json>");
  process.exit(1);
}

const abs = path.resolve(file);
const json = fs.readFileSync(abs, "utf8");
JSON.parse(json);
const encoded = Buffer.from(json, "utf8").toString("base64");

console.log("\nAdd to Vercel → Environment Variables:\n");
console.log("Name:  FIREBASE_SERVICE_ACCOUNT_BASE64");
console.log("Value: (copy below)\n");
console.log(encoded);
console.log("\nEnable Production + Preview, then Redeploy.\n");
