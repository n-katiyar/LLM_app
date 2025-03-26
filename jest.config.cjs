module.exports = {
  roots: ["<rootDir>/src"],
  moduleDirectories: ["node_modules", "src"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1" // Enables `@/` alias for `src/`
  },
  setupFilesAfterEnv: ["<rootDir>/src/tests/setupTests.ts"],
};
