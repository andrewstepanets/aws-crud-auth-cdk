module.exports = {
    testEnvironment: 'node',
    roots: ['<rootDir>'],
    testMatch: ['**/*.test.ts'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    collectCoverage: false,
    collectCoverageFrom: ['lambdas/**/*.ts'],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'html'],
};
