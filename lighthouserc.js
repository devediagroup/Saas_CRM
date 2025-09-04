// 🔧 Lighthouse CI Configuration for EchoOps CRM
module.exports = {
    ci: {
        collect: {
            url: ['http://localhost:8080'],
            startServerCommand: 'npm run preview',
            startServerReadyPattern: 'Local:',
            startServerReadyTimeout: 30000,
            numberOfRuns: 3,
        },
        assert: {
            preset: 'lighthouse:recommended',
            assertions: {
                'categories:performance': ['warn', { minScore: 0.8 }],
                'categories:accessibility': ['error', { minScore: 0.9 }],
                'categories:best-practices': ['warn', { minScore: 0.85 }],
                'categories:seo': ['warn', { minScore: 0.8 }],
                'categories:pwa': ['warn', { minScore: 0.7 }],

                // Performance budgets
                'resource-summary:script:size': ['error', { maxNumericValue: 200000 }], // 200KB max
                'resource-summary:stylesheet:size': ['warn', { maxNumericValue: 50000 }], // 50KB max
                'resource-summary:image:size': ['warn', { maxNumericValue: 500000 }], // 500KB max
                'resource-summary:total:size': ['warn', { maxNumericValue: 1000000 }], // 1MB max

                // Core Web Vitals
                'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
                'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
                'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
                'total-blocking-time': ['warn', { maxNumericValue: 300 }],

                // Bundle optimizations
                'unused-javascript': ['warn', { maxNumericValue: 20000 }],
                'unused-css-rules': ['warn', { maxNumericValue: 10000 }],
                'unminified-css': 'error',
                'unminified-javascript': 'error',
                'uses-text-compression': 'error',
                'uses-optimized-images': 'warn',
                'modern-image-formats': 'warn',
                'efficient-animated-content': 'warn',

                // Security
                'is-on-https': 'off', // Skip for localhost
                'redirects-http': 'off', // Skip for localhost
                'uses-https': 'off', // Skip for localhost
            },
        },
        upload: {
            target: 'temporary-public-storage',
            reportFilenamePattern: 'lighthouse-%%DATETIME%%-%%HOSTNAME%%.%%EXTENSION%%',
        },
        server: {
            port: 9009,
            storage: './lighthouse-results',
        },
    },
};
