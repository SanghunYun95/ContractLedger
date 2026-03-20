# ContractLedger

ContractLedger is designed to be a core backend module for managing contracts efficiently, securely, and with full audit and notification features in a B2B SaaS environment. Built on modern technologies like Nest.js and TypeScript, it supports multi-tenant infrastructures and adheres to clean architecture principles.

## Features

- **Multi-Tenant Authorization**: Ensures isolated and secure access to tenant-specific data.
- **Audit Logging**: Comprehensive event-driven logging for all critical operations.
- **Notification System**: Integrates with external AI engines to provide timely alerts and information.

## Built With

- **Node.js**
- **TypeScript**
- **Nest.js**
- **MySQL** via **TypeORM**

## Getting Started

### Prerequisites
- Node.js >= 18
- MySQL database

### Installation

1. Clone the repository:
   ```bash
   git clone git@github.com:SanghunYun95/ContractLedger.git
   cd ContractLedger
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your `.env` file for database configuration and application settings.

### Running the Application

```bash
npm run start:dev
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with 💖 by Sanghun Yun and the team!