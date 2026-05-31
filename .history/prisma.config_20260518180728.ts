import { defineConfig } from "prisma/config";

export default defineConfig({
  earlyAccess: true,
  schema: {
    kind:   "single",
    file:   "./prisma/schema.prisma",
  },
});