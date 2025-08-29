import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    // Set your global test timeout (in ms)
    testTimeout: 180_000,
  },
})
