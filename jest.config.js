module.exports = {
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    // uuid v13+ は ESM のみのため、ts-jest でトランスパイル
    'node_modules/uuid/.+\\.js$': 'ts-jest'
  },
  // uuid v13+ は ESM のみのため、トランスパイル対象に含める
  transformIgnorePatterns: ['/node_modules/(?!(uuid)/)'],
  testEnvironment: 'node',
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons']
  },
  testTimeout: 60_000,
  maxWorkers: '50%',
  passWithNoTests: true
}
