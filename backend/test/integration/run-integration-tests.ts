import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

interface TestResult {
    suite: string;
    tests: number;
    passed: number;
    failed: number;
    duration: number;
    status: 'passed' | 'failed' | 'skipped';
}

class IntegrationTestRunner {
    private results: TestResult[] = [];
    private startTime: number = 0;

    constructor() {
        this.startTime = Date.now();
    }

    async runAllTests(): Promise<void> {
        console.log('🚀 Starting EchoOps CRM Integration Tests...\n');

        const testSuites = [
            'auth.integration.spec.ts',
            'leads.integration.spec.ts',
            'properties.integration.spec.ts',
            'users.integration.spec.ts'
        ];

        for (const suite of testSuites) {
            await this.runTestSuite(suite);
        }

        this.generateReport();
    }

    private async runTestSuite(suiteName: string): Promise<void> {
        console.log(`\n📋 Running ${suiteName}...`);
        const startTime = Date.now();

        try {
            // Run Jest for specific test file
            const testPath = path.join(__dirname, suiteName);

            if (!fs.existsSync(testPath)) {
                console.log(`⚠️  Test file not found: ${suiteName}`);
                this.results.push({
                    suite: suiteName,
                    tests: 0,
                    passed: 0,
                    failed: 0,
                    duration: 0,
                    status: 'skipped'
                });
                return;
            }

            const jestCommand = `npx jest ${testPath} --config=jest-integration.config.json --verbose --detectOpenHandles --forceExit`;
            const output = execSync(jestCommand, {
                cwd: path.join(__dirname, '../../'),
                encoding: 'utf-8',
                stdio: 'pipe'
            });

            const duration = Date.now() - startTime;
            const result = this.parseJestOutput(output, suiteName, duration);
            this.results.push(result);

            console.log(`✅ ${suiteName} completed - ${result.passed}/${result.tests} passed (${duration}ms)`);

        } catch (error: any) {
            const duration = Date.now() - startTime;
            console.log(`❌ ${suiteName} failed (${duration}ms)`);

            // Parse error output for test counts
            const errorOutput = error.stdout || error.message || '';
            const result = this.parseJestOutput(errorOutput, suiteName, duration, true);
            this.results.push(result);

            if (error.stdout) {
                console.log('Error output:', error.stdout.slice(-500)); // Last 500 chars
            }
        }
    }

    private parseJestOutput(output: string, suiteName: string, duration: number, failed: boolean = false): TestResult {
        // Parse Jest output to extract test statistics
        const testRegex = /Tests:\s+(\d+)\s+failed,\s*(\d+)\s+passed,\s*(\d+)\s+total/;
        const simpleTestRegex = /Tests:\s+(\d+)\s+passed,\s*(\d+)\s+total/;
        const failedTestRegex = /Tests:\s+(\d+)\s+failed,\s*(\d+)\s+total/;

        let tests = 0;
        let passed = 0;
        let failedCount = 0;

        if (testRegex.test(output)) {
            const match = output.match(testRegex);
            if (match) {
                failedCount = parseInt(match[1]);
                passed = parseInt(match[2]);
                tests = parseInt(match[3]);
            }
        } else if (simpleTestRegex.test(output)) {
            const match = output.match(simpleTestRegex);
            if (match) {
                passed = parseInt(match[1]);
                tests = parseInt(match[2]);
                failedCount = tests - passed;
            }
        } else if (failedTestRegex.test(output)) {
            const match = output.match(failedTestRegex);
            if (match) {
                failedCount = parseInt(match[1]);
                tests = parseInt(match[2]);
                passed = tests - failedCount;
            }
        } else {
            // Default values if parsing fails
            tests = failed ? 1 : 0;
            passed = failed ? 0 : 0;
            failedCount = failed ? 1 : 0;
        }

        return {
            suite: suiteName,
            tests,
            passed,
            failed: failedCount,
            duration,
            status: failedCount > 0 ? 'failed' : 'passed'
        };
    }

    private generateReport(): void {
        const totalDuration = Date.now() - this.startTime;
        const totalTests = this.results.reduce((sum, result) => sum + result.tests, 0);
        const totalPassed = this.results.reduce((sum, result) => sum + result.passed, 0);
        const totalFailed = this.results.reduce((sum, result) => sum + result.failed, 0);
        const passedSuites = this.results.filter(result => result.status === 'passed').length;
        const failedSuites = this.results.filter(result => result.status === 'failed').length;
        const skippedSuites = this.results.filter(result => result.status === 'skipped').length;

        console.log('\n' + '='.repeat(60));
        console.log('🏆 INTEGRATION TESTS SUMMARY');
        console.log('='.repeat(60));

        console.log(`\n📊 Overall Results:`);
        console.log(`   Total Test Suites: ${this.results.length}`);
        console.log(`   ✅ Passed Suites: ${passedSuites}`);
        console.log(`   ❌ Failed Suites: ${failedSuites}`);
        console.log(`   ⏭️  Skipped Suites: ${skippedSuites}`);
        console.log(`   ⏱️  Total Duration: ${(totalDuration / 1000).toFixed(2)}s`);

        console.log(`\n🧪 Test Details:`);
        console.log(`   Total Tests: ${totalTests}`);
        console.log(`   ✅ Passed: ${totalPassed}`);
        console.log(`   ❌ Failed: ${totalFailed}`);
        console.log(`   📈 Success Rate: ${totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0}%`);

        console.log(`\n📋 Suite Breakdown:`);
        this.results.forEach(result => {
            const icon = result.status === 'passed' ? '✅' : result.status === 'failed' ? '❌' : '⏭️';
            const successRate = result.tests > 0 ? ((result.passed / result.tests) * 100).toFixed(1) : '0';

            console.log(`   ${icon} ${result.suite}`);
            console.log(`      Tests: ${result.passed}/${result.tests} (${successRate}%)`);
            console.log(`      Duration: ${(result.duration / 1000).toFixed(2)}s`);
        });

        // Performance insights
        console.log(`\n⚡ Performance Insights:`);
        const sortedByDuration = [...this.results].sort((a, b) => b.duration - a.duration);
        console.log(`   Slowest Suite: ${sortedByDuration[0]?.suite} (${(sortedByDuration[0]?.duration / 1000).toFixed(2)}s)`);
        console.log(`   Fastest Suite: ${sortedByDuration[sortedByDuration.length - 1]?.suite} (${(sortedByDuration[sortedByDuration.length - 1]?.duration / 1000).toFixed(2)}s)`);

        const avgDuration = this.results.length > 0 ? this.results.reduce((sum, r) => sum + r.duration, 0) / this.results.length : 0;
        console.log(`   Average Duration: ${(avgDuration / 1000).toFixed(2)}s`);

        // Recommendations
        console.log(`\n💡 Recommendations:`);
        if (failedSuites > 0) {
            console.log(`   • Review and fix ${failedSuites} failed test suite(s)`);
        }
        if (avgDuration > 5000) {
            console.log(`   • Consider optimizing test performance (current avg: ${(avgDuration / 1000).toFixed(2)}s)`);
        }
        if (totalTests === 0) {
            console.log(`   • No tests were found or executed`);
        }
        if (totalPassed === totalTests && totalTests > 0) {
            console.log(`   • 🎉 All tests passed! Consider adding more test cases`);
        }

        console.log('\n' + '='.repeat(60));

        // Save results to file
        this.saveResultsToFile();
    }

    private saveResultsToFile(): void {
        const reportData = {
            timestamp: new Date().toISOString(),
            summary: {
                total_suites: this.results.length,
                passed_suites: this.results.filter(r => r.status === 'passed').length,
                failed_suites: this.results.filter(r => r.status === 'failed').length,
                skipped_suites: this.results.filter(r => r.status === 'skipped').length,
                total_tests: this.results.reduce((sum, r) => sum + r.tests, 0),
                total_passed: this.results.reduce((sum, r) => sum + r.passed, 0),
                total_failed: this.results.reduce((sum, r) => sum + r.failed, 0),
                total_duration_ms: Date.now() - this.startTime
            },
            results: this.results
        };

        const reportPath = path.join(__dirname, '../../integration-test-results.json');
        fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
        console.log(`📄 Detailed results saved to: ${reportPath}`);
    }
}

// Main execution
async function main() {
    const runner = new IntegrationTestRunner();

    try {
        await runner.runAllTests();
        process.exit(0);
    } catch (error) {
        console.error('❌ Integration test runner failed:', error);
        process.exit(1);
    }
}

// Run if this file is executed directly
if (require.main === module) {
    main();
}

export { IntegrationTestRunner };
