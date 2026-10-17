const { loadEnv, defineConfig } = require('@medusajs/framework/utils');

loadEnv(process.env.NODE_ENV || 'development', process.cwd());

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS || "http://localhost:3000,http://localhost:3001",
      adminCors: process.env.ADMIN_CORS || "http://localhost:3000,http://localhost:3001,http://localhost:9000,http://localhost:5173",
      authCors: process.env.AUTH_CORS || "http://localhost:3000,http://localhost:3001,http://localhost:9000,http://localhost:5173",
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  admin: {
    disable: true,
  },
  modules: [
    {
      resolve: "./src/modules/composer",
    },
    {
      resolve: "./src/modules/score",
    },
    {
      resolve: "./src/modules/download",
    },
    {
      resolve: "./src/modules/payout",
    },
    {
      resolve: "./src/modules/cms",
    },
    {
      resolve: "./src/modules/customer",
    },
  ]
});
