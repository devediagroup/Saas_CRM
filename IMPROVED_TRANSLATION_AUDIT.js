#!/usr/bin/env node

/**
 * Improved Translation Keys Audit Script
 * This script properly audits translation keys by ignoring import paths
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

    // Improved patterns to match only actual t() calls, not import paths
    const patterns = [
        // Standard t('key') or t("key")
        /(?:^|[^'"\/])\bt\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
        // t('key', {params})
        /(?:^|[^'"\/])\bt\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*\{[^}]*\}\s*\)/g,
        // Template strings with t(`key`)
        /(?:^|[^'"\/])\bt\s*\(\s*`([^`]+)`\s*\)/g,
    ];

    patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
            const key = match[1];
            // Filter out paths, URLs, and other non-translation keys
            if (!key.includes('/') && !key.includes('\\') && !key.includes('http') &&
                !key.includes('.tsx') && !key.includes('.ts') && !key.includes('.js') &&
                !key.includes('import') && !key.includes('from') && !key.includes('<') &&
                !key.includes('>') && key.length > 2 && key.length < 100) {
                keys.push(key);
            }
        }
    });

    return [...new Set(keys)]; // Remove duplicates
}

// Function to scan directory for .tsx and .ts files (excluding node_modules)
function scanDirectory(dir) {
    const usedKeys = new Set();

    function scanFile(filePath) {
        if ((filePath.endsWith('.tsx') || filePath.endsWith('.ts')) &&
            !filePath.includes('node_modules') &&
            !filePath.includes('.test.') &&
            !filePath.includes('.spec.')) {
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                // Only scan files that actually use translation
                if (content.includes('useTranslation') || content.includes('from \'react-i18next\'')) {
                    const keys = extractTranslationKeys(content);
                    keys.forEach(key => {
                        if (key.trim()) {
                            usedKeys.add(key.trim());
                        }
                    });
                }
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
                if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules' && item !== 'build' && item !== 'dist') {
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
    return Array.from(usedKeys).sort();
}

// Get all available keys from translation files
const arKeys = getAllKeys(arTranslations).sort();
const enKeys = getAllKeys(enTranslations).sort();

// Scan frontend for used translation keys
console.log('🔍 Scanning for translation keys...');
const usedKeys = scanDirectory('./frontend/src');

console.log('\n🔍 TRANSLATION AUDIT REPORT');
console.log('============================\n');

console.log(`📊 STATISTICS:`);
console.log(`- Arabic translation keys: ${arKeys.length}`);
console.log(`- English translation keys: ${enKeys.length}`);
console.log(`- Used keys in application: ${usedKeys.length}\n`);

// Find missing keys in Arabic
const missingInArabic = usedKeys.filter(key => !arKeys.includes(key));
console.log(`❌ MISSING IN ARABIC (${missingInArabic.length} keys):`);
if (missingInArabic.length > 0) {
    missingInArabic.slice(0, 30).forEach(key => console.log(`  - ${key}`));
    if (missingInArabic.length > 30) {
        console.log(`  ... and ${missingInArabic.length - 30} more`);
    }
} else {
    console.log('  ✅ All used keys are present in Arabic file');
}
console.log('');

// Find missing keys in English
const missingInEnglish = usedKeys.filter(key => !enKeys.includes(key));
console.log(`❌ MISSING IN ENGLISH (${missingInEnglish.length} keys):`);
if (missingInEnglish.length > 0) {
    missingInEnglish.slice(0, 30).forEach(key => console.log(`  - ${key}`));
    if (missingInEnglish.length > 30) {
        console.log(`  ... and ${missingInEnglish.length - 30} more`);
    }
} else {
    console.log('  ✅ All used keys are present in English file');
}
console.log('');

// Find keys present in English but not in Arabic
const enOnlyKeys = enKeys.filter(key => !arKeys.includes(key));
console.log(`🔄 ENGLISH ONLY KEYS (${enOnlyKeys.length} keys):`);
if (enOnlyKeys.length > 0) {
    enOnlyKeys.slice(0, 20).forEach(key => console.log(`  - ${key}`));
    if (enOnlyKeys.length > 20) {
        console.log(`  ... and ${enOnlyKeys.length - 20} more`);
    }
} else {
    console.log('  ✅ No English-only keys found');
}
console.log('');

// Find keys present in Arabic but not in English
const arOnlyKeys = arKeys.filter(key => !enKeys.includes(key));
console.log(`🔄 ARABIC ONLY KEYS (${arOnlyKeys.length} keys):`);
if (arOnlyKeys.length > 0) {
    arOnlyKeys.slice(0, 20).forEach(key => console.log(`  - ${key}`));
    if (arOnlyKeys.length > 20) {
        console.log(`  ... and ${arOnlyKeys.length - 20} more`);
    }
} else {
    console.log('  ✅ No Arabic-only keys found');
}
console.log('');

// Summary
console.log('📋 SUMMARY:');
console.log(`- Keys missing from Arabic: ${missingInArabic.length}`);
console.log(`- Keys missing from English: ${missingInEnglish.length}`);
console.log(`- English-only keys: ${enOnlyKeys.length}`);
console.log(`- Arabic-only keys: ${arOnlyKeys.length}`);

const hasIssues = missingInArabic.length > 0 || missingInEnglish.length > 0 ||
    arOnlyKeys.length > 0 || enOnlyKeys.length > 0;

if (hasIssues) {
    console.log('\n⚠️  ISSUES FOUND! Please review and fix the missing/inconsistent keys.');

    // Create fix files
    if (missingInArabic.length > 0) {
        console.log('\n📝 Creating missing_arabic_keys.txt...');
        fs.writeFileSync('./missing_arabic_keys.txt',
            'Missing Arabic Translation Keys:\n' +
            '================================\n\n' +
            missingInArabic.map(key => `- ${key}`).join('\n')
        );
    }

    if (missingInEnglish.length > 0) {
        console.log('📝 Creating missing_english_keys.txt...');
        fs.writeFileSync('./missing_english_keys.txt',
            'Missing English Translation Keys:\n' +
            '=================================\n\n' +
            missingInEnglish.map(key => `- ${key}`).join('\n')
        );
    }

} else {
    console.log('\n✅ ALL TRANSLATION KEYS ARE PROPERLY SYNCHRONIZED!');
}

// Save used keys for reference
console.log('\n📝 Saving used_translation_keys.txt for reference...');
fs.writeFileSync('./used_translation_keys.txt',
    'All Translation Keys Used in Application:\n' +
    '========================================\n\n' +
    usedKeys.map(key => `- ${key}`).join('\n')
);

console.log('\n✅ Audit complete!');