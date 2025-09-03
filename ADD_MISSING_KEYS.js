#!/usr/bin/env node

/**
 * Add Missing Translation Keys Script
 * This script automatically adds all missing translation keys to both Arabic and English files
 */

const fs = require('fs');
const path = require('path');

// Read current translation files
const arTranslations = JSON.parse(fs.readFileSync('./frontend/src/locales/ar.json', 'utf8'));
const enTranslations = JSON.parse(fs.readFileSync('./frontend/src/locales/en.json', 'utf8'));

// Read missing keys
const missingArabicKeys = fs.readFileSync('./missing_arabic_keys.txt', 'utf8').split('\n').filter(line => line.startsWith('- ')).map(line => line.substring(2));
const missingEnglishKeys = fs.readFileSync('./missing_english_keys.txt', 'utf8').split('\n').filter(line => line.startsWith('- ')).map(line => line.substring(2));

// Function to set nested object property
function setNestedProperty(obj, path, value) {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
            current[keys[i]] = {};
        }
        current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
}

// Function to get default translation value
function getDefaultTranslation(key, isArabic = false) {
    // Convert camelCase to readable text
    const lastPart = key.split('.').pop();
    let readable = lastPart.replace(/([A-Z])/g, ' $1').toLowerCase();
    readable = readable.charAt(0).toUpperCase() + readable.slice(1);

    // Arabic translations for common terms
    const arabicTranslations = {
        'actions': 'الإجراءات',
        'add': 'إضافة',
        'all': 'الكل',
        'amount': 'المبلغ',
        'cancel': 'إلغاء',
        'completed': 'مكتمل',
        'create': 'إنشاء',
        'delete': 'حذف',
        'description': 'الوصف',
        'edit': 'تعديل',
        'email': 'البريد الإلكتروني',
        'error': 'خطأ',
        'loading': 'جاري التحميل...',
        'name': 'الاسم',
        'new': 'جديد',
        'phone': 'الهاتف',
        'save': 'حفظ',
        'saving': 'جاري الحفظ...',
        'search': 'بحث',
        'status': 'الحالة',
        'success': 'نجح',
        'title': 'العنوان',
        'update': 'تحديث',
        'active': 'نشط',
        'inactive': 'غير نشط',
        'scheduled': 'مجدول',
        'pending': 'معلق',
        'high': 'عالي',
        'medium': 'متوسط',
        'low': 'منخفض',
        'urgent': 'عاجل',
        'company': 'الشركة',
        'companies': 'الشركات',
        'subtitle': 'العنوان الفرعي',
        'placeholder': 'النص التوضيحي',
        'filter': 'فلتر',
        'table': 'الجدول',
        'form': 'النموذج',
        'messages': 'الرسائل',
        'stats': 'الإحصائيات',
        'total': 'الإجمالي',
        'revenue': 'الإيرادات',
        'deals': 'الصفقات',
        'leads': 'العملاء المحتملون',
        'properties': 'العقارات',
        'activities': 'الأنشطة',
        'analytics': 'التحليلات',
        'billing': 'الفواتير',
        'visit': 'زيارة',
        'recommendation': 'التوصية',
        'recommendations': 'التوصيات',
        'confidence': 'الثقة',
        'score': 'النقاط',
        'client': 'العميل',
        'deal': 'الصفقة',
        'forecast': 'التوقع',
        'probability': 'الاحتمالية',
        'grade': 'الدرجة',
        'priority': 'الأولوية',
        'category': 'الفئة',
        'applied': 'مطبق',
        'rejected': 'مرفوض',
        'expired': 'منتهي الصلاحية'
    };

    if (isArabic) {
        // Try to find Arabic translation for the key
        if (arabicTranslations[lastPart]) {
            return arabicTranslations[lastPart];
        }
        // Return Arabic placeholder
        return `[${readable}]`;
    }

    return readable;
}

console.log('📝 Adding missing Arabic translation keys...');
missingArabicKeys.forEach(key => {
    if (key.trim()) {
        setNestedProperty(arTranslations, key.trim(), getDefaultTranslation(key.trim(), true));
    }
});

console.log('📝 Adding missing English translation keys...');
missingEnglishKeys.forEach(key => {
    if (key.trim()) {
        setNestedProperty(enTranslations, key.trim(), getDefaultTranslation(key.trim(), false));
    }
});

// Write updated files
console.log('💾 Writing updated Arabic translation file...');
fs.writeFileSync('./frontend/src/locales/ar.json', JSON.stringify(arTranslations, null, 2), 'utf8');

console.log('💾 Writing updated English translation file...');
fs.writeFileSync('./frontend/src/locales/en.json', JSON.stringify(enTranslations, null, 2), 'utf8');

console.log('✅ Successfully added all missing translation keys!');
console.log(`📊 Added ${missingArabicKeys.filter(k => k.trim()).length} Arabic keys`);
console.log(`📊 Added ${missingEnglishKeys.filter(k => k.trim()).length} English keys`);