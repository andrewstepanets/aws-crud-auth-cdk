module.exports = {
    testEnvironment: 'node',
    roots: ['<rootDir>'],
    testMatch: ['**/*.test.ts'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    moduleNameMapper: {
        '^@utils/(.*)$': '<rootDir>/utils/$1',
    },
    collectCoverage: false,
    collectCoverageFrom: ['lambdas/**/*.ts'],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'html'],
};
