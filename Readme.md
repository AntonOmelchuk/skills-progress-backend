## 📁 Project Architecture (Backend)

cyberpunk-rpg-backend/
├── node_modules/ # Installed dependencies
├── src/
│ ├── config/ # Environment setups, Firebase config
│ ├── controllers/ # The actual logic: what happens when a route is hit
│ ├── middlewares/ # Security checks, like verifying the Firebase token
│ ├── prisma/ # Database connection and database schema
│ ├── routes/ # URL definitions mapping to specific controllers
│ ├── services/ # Heavy calculations, like the Decay algorithm
│ └── index.ts # The main entry point and server setup
├── package.json # Project metadata and dependency list
└── tsconfig.json # Strict TypeScript compiler configuration
