const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

// Config spécifique pour les tests Node (API routes)
const customJestConfig = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup-node.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: ['**/__tests__/api/**/*.[jt]s?(x)', '**/__tests__/middleware.test.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!(jose)/)',
  ],
  collectCoverageFrom: [
    // API Routes testées
    'middleware.ts',
    'app/api/auth/**/*.ts',
    'app/api/boards/**/*.ts',
    'app/api/workspaces/**/*.ts',
    'app/api/cards/**/*.ts',
    // Exclusions
    '!app/api/auth/me/**',
    '!app/api/auth/logout/**',
    '!app/api/auth/password/**',
    '!app/api/auth/profile/**',
    '!app/api/cards/[id]/details/**',
    '!app/api/workspaces/[id]/members/**',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
  ],
  coverageThreshold: {
    global: {
      statements: 30,
      branches: 25,
      functions: 30,
      lines: 30,
    },
  },
}

module.exports = createJestConfig(customJestConfig)

