import { defineConfig } from 'prisma/config'

export default defineConfig({
  seed: 'npx ts-node prisma/seed.ts'
})
