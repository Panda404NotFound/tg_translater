module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    // Мок для CSS/стилей
    '\\.(css|less|scss|sass)$': '<rootDir>/tests/__mocks__/styleMock.js',
    // Мок для файлов (изображения, шрифты и т.д.)
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/tests/__mocks__/fileMock.js',
    // Алиасы путей
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@client/(.*)$': '<rootDir>/src/client/$1',
    '^@server/(.*)$': '<rootDir>/src/server/$1'
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  // Покрытие кода тестами
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/client/index.tsx',
    '!src/server/index.ts'
  ],
  // Преобразование кода
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  // Игнорирование трансформации
  transformIgnorePatterns: [
    '/node_modules/(?!(@twa-dev/sdk)).+\\.js$'
  ],
  // Глобальные переменные
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  }
}; 