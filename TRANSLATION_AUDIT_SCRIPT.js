#!/usr/bin/env node

/**
 * Translation Keys Audit Script
 * This script audits all translation keys used across the React application
 * and compares them with the available keys in Arabic and English files
 */

const fs = require('fs');
const path = require('path');

// Read translation files
const arTranslations = JSON.parse(fs.readFileSync('./frontend/src/locales/ar.json', 'utf8'));
const enTranslations = JSON.parse(fs.readFileSync('./frontend/src/locales/en.json', 'utf8'));

// Function to get all keys from an object recursively
function getAllKeys(obj, prefix = '') {
    let keys = [];
    for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            keys = keys.concat(getAllKeys(obj[key], prefix ? `${prefix}.${key}` : key));
        } else {
            keys.push(prefix ? `${prefix}.${key}` : key);
        }
    }
    return keys;
}

// Function to extract translation keys from a file
function extractTranslationKeys(content) {
    const keys = [];
    // Pattern for t('key') or t("key")
    const patterns = [
        /t\(['"`]([^'"`]+)['"`]\)/g,
        /t\(['"`]([^'"`]+)['"`],\s*\{[^}]*\}\)/g,
    ];

    patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
            keys.push(match[1]);
        }
    });

    return [...new Set(keys)]; // Remove duplicates
}

// Function to scan directory for .tsx and .ts files
function scanDirectory(dir) {
    const usedKeys = new Set();

    function scanFile(filePath) {
        if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                const keys = extractTranslationKeys(content);
                keys.forEach(key => usedKeys.add(key));
            } catch (error) {
                console.warn(`Warning: Could not read file ${filePath}`);
            }
        }
    }

    function scanDir(currentDir) {
        try {
            const items = fs.readdirSync(currentDir);
            items.forEach(item => {
                const fullPath = path.join(currentDir, item);
                const stat = fs.statSync(fullPath);
                if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
                    scanDir(fullPath);
                } else if (stat.isFile()) {
                    scanFile(fullPath);
                }
            });
        } catch (error) {
            console.warn(`Warning: Could not scan directory ${currentDir}`);
        }
    }

    scanDir(dir);
    return Array.from(usedKeys);
}

// Get all available keys from translation files
const arKeys = getAllKeys(arTranslations);
const enKeys = getAllKeys(enTranslations);

// Scan frontend for used translation keys
const usedKeys = scanDirectory('./frontend/src');

console.log('🔍 TRANSLATION AUDIT REPORT');
console.log('============================\n');

console.log(`📊 STATISTICS:`);
console.log(`- Arabic translation keys: ${arKeys.length}`);
console.log(`- English translation keys: ${enKeys.length}`);
console.log(`- Used keys in application: ${usedKeys.length}\n`);

// Find missing keys in Arabic
const missingInArabic = usedKeys.filter(key => !arKeys.includes(key));
console.log(`❌ MISSING IN ARABIC (${missingInArabic.length} keys):`);
if (missingInArabic.length > 0) {
    missingInArabic.forEach(key => console.log(`  - ${key}`));
} else {
    console.log('  ✅ All used keys are present in Arabic file');
}
console.log('');

// Find missing keys in English
const missingInEnglish = usedKeys.filter(key => !enKeys.includes(key));
console.log(`❌ MISSING IN ENGLISH (${missingInEnglish.length} keys):`);
if (missingInEnglish.length > 0) {
    missingInEnglish.forEach(key => console.log(`  - ${key}`));
} else {
    console.log('  ✅ All used keys are present in English file');
}
console.log('');

// Find keys present in Arabic but not in English
const arOnlyKeys = arKeys.filter(key => !enKeys.includes(key));
console.log(`🔄 ARABIC ONLY KEYS (${arOnlyKeys.length} keys):`);
if (arOnlyKeys.length > 0) {
    arOnlyKeys.forEach(key => console.log(`  - ${key}`));
} else {
    console.log('  ✅ No Arabic-only keys found');
}
console.log('');

// Find keys present in English but not in Arabic
const enOnlyKeys = enKeys.filter(key => !arKeys.includes(key));
console.log(`🔄 ENGLISH ONLY KEYS (${enOnlyKeys.length} keys):`);
if (enOnlyKeys.length > 0) {
    enOnlyKeys.forEach(key => console.log(`  - ${key}`));
} else {
    console.log('  ✅ No English-only keys found');
}
console.log('');

// Find unused keys in Arabic
const unusedArKeys = arKeys.filter(key => !usedKeys.includes(key));
console.log(`🗑️ UNUSED ARABIC KEYS (${unusedArKeys.length} keys):`);
if (unusedArKeys.length > 0) {
    unusedArKeys.slice(0, 20).forEach(key => console.log(`  - ${key}`));
    if (unusedArKeys.length > 20) {
        console.log(`  ... and ${unusedArKeys.length - 20} more`);
    }
} else {
    console.log('  ✅ All Arabic keys are being used');
}
console.log('');

// Find unused keys in English
const unusedEnKeys = enKeys.filter(key => !usedKeys.includes(key));
console.log(`🗑️ UNUSED ENGLISH KEYS (${unusedEnKeys.length} keys):`);
if (unusedEnKeys.length > 0) {
    unusedEnKeys.slice(0, 20).forEach(key => console.log(`  - ${key}`));
    if (unusedEnKeys.length > 20) {
        console.log(`  ... and ${unusedEnKeys.length - 20} more`);
    }
} else {
    console.log('  ✅ All English keys are being used');
}
console.log('');

// Summary
console.log('📋 SUMMARY:');
console.log(`- Keys missing from Arabic: ${missingInArabic.length}`);
console.log(`- Keys missing from English: ${missingInEnglish.length}`);
console.log(`- Arabic-only keys: ${arOnlyKeys.length}`);
console.log(`- English-only keys: ${enOnlyKeys.length}`);
console.log(`- Unused Arabic keys: ${unusedArKeys.length}`);
console.log(`- Unused English keys: ${unusedEnKeys.length}`);

const hasIssues = missingInArabic.length > 0 || missingInEnglish.length > 0 ||
    arOnlyKeys.length > 0 || enOnlyKeys.length > 0;

if (hasIssues) {
    console.log('\n⚠️  ISSUES FOUND! Please review and fix the missing/inconsistent keys.');
    process.exit(1);
} else {
    console.log('\n✅ ALL TRANSLATION KEYS ARE PROPERLY SYNCHRONIZED!');
    process.exit(0);
}