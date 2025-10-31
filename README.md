# SolEarn 🚀

**A decentralized bounty platform built on Solana blockchain connecting clients with skilled developers for project completion.**

[![Solana](https://img.shields.io/badge/Solana-4a8Lgwhx7oQZUEUHq2m3B5yZJkZXrzLthYRjn3TCRCfc-blue?style=flat-square)](https://solana.com/)
[![Anchor](https://img.shields.io/badge/Anchor-0.31.1-orange?style=flat-square)](https://www.anchor-lang.com/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square)](https://www.typescriptlang.org/)

## 📖 Overview

SolEarn is a full-stack Web3 application that revolutionizes how clients and developers connect through blockchain-powered bounty systems. Built on Solana's high-performance blockchain, it provides secure escrow services, transparent payment processing, and a seamless user experience for both bounty creators and solvers.

## ✨ Features

### 🔐 **Smart Contract Features**
- **Secure Escrow System**: SOL held in escrow until bounty completion
- **Bounty Management**: Create, update, and delete bounties with full control
- **Submission System**: Developers can submit solutions with work URLs
- **Winner Selection**: Client-driven selection with automatic reward distribution
- **Account Management**: User and client profile creation and management

### 🎯 **User Experience**
- **Role-Based Dashboards**: Separate interfaces for clients and developers
- **Real-Time Analytics**: Performance metrics and activity tracking
- **Wallet Integration**: Seamless Solana wallet connection
- **Responsive Design**: Modern UI built with TailwindCSS and Radix UI
- **Mobile-First**: Optimized for all device sizes

### 🛡️ **Security & Reliability**
- **Program ID**: `4a8Lgwhx7oQZUEUHq2m3B5yZJkZXrzLthYRjn3TCRCfc`
- **Anchor Framework**: Industry-standard Solana development framework
- **Type Safety**: Full TypeScript implementation
- **Error Handling**: Comprehensive error management and user feedback

## 🏗️ Architecture

### **Backend (Solana Program)**
```
solearn/
├── programs/solearn/          # Rust smart contracts
│   ├── src/
│   │   ├── instructions/     # Program instructions
│   │   ├── states/          # Account data structures
│   │   └── errors/          # Custom error definitions
│   └── tests/               # Comprehensive test suite
└── Anchor.toml              # Anchor configuration
```

### **Frontend (React Application)**
```
src/
├── components/               # Reusable UI components
├── pages/                   # Application pages
├── contexts/                # React context providers
├── hooks/                   # Custom React hooks
├── lib/                     # Utility functions and API
└── types/                   # TypeScript type definitions
```

## 🚀 Getting Started

### **Prerequisites**
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Yarn](https://yarnpkg.com/) or [npm](https://www.npmjs.com/)
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools)
- [Anchor CLI](https://www.anchor-lang.com/docs/installation)

### **Installation**

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd solearn-frontend
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Install program dependencies**
```bash
cd solearn
yarn install
```

4. **Build the Solana program**
```bash
anchor build
```

### **Development**

1. **Start the frontend development server**
```bash
npm run dev
```

2. **Run program tests**
```bash
cd solearn
anchor test
```

3. **Deploy to devnet**
```bash
cd solearn
anchor deploy --provider.cluster devnet
```

## 🎮 Usage

### **For Clients (Bounty Creators)**

1. **Connect Wallet**: Use any Solana wallet (Phantom, Solflare, etc.)
2. **Create Profile**: Set up your company information
3. **Post Bounties**: Define project requirements, skills needed, and reward amount
4. **Review Submissions**: Evaluate developer proposals
5. **Select Winner**: Choose the best solution and automatically release payment

### **For Developers (Bounty Solvers)**

1. **Connect Wallet**: Connect your Solana wallet
2. **Create Profile**: Add your skills and experience
3. **Browse Bounties**: Find projects matching your expertise
4. **Submit Solutions**: Provide work URLs and descriptions
5. **Earn Rewards**: Get paid in SOL upon selection

## 🔧 Configuration

### **Network Configuration**
The application supports multiple Solana networks:
- **Localnet**: Development and testing
- **Devnet**: Public test network
- **Mainnet**: Production network

### **Environment Variables**
```bash
# Frontend
VITE_SOLANA_NETWORK=devnet
VITE_PROGRAM_ID=4a8Lgwhx7oQZUEUHq2m3B5yZJkZXrzLthYRjn3TCRCfc

# Program
ANCHOR_PROVIDER_URL=https://api.devnet.solana.com
ANCHOR_WALLET=~/.config/solana/id.json
```

## 🧪 Testing

### **Program Tests**
```bash
cd solearn
anchor test
```

**Test Coverage:**
- ✅ User Management (Create, Update, Delete)
- ✅ Client Management (Create, Update, Delete)
- ✅ Bounty Management (Create, Submit, Select, Delete)
- ✅ Escrow System (Deposit, Release)
- ✅ Error Handling (Validation, Authorization)

### **Frontend Tests**
```bash
npm run test
npm run test:coverage
```

## 📦 Build & Deploy

### **Build Frontend**
```bash
npm run build
```

### **Deploy Program**
```bash
# Local deployment
anchor deploy

# Devnet deployment
anchor deploy --provider.cluster devnet

# Mainnet deployment
anchor deploy --provider.cluster mainnet
```

## 🛠️ Technology Stack

### **Blockchain**
- **Solana**: High-performance blockchain platform
- **Anchor**: Framework for Solana program development
- **Rust**: Smart contract programming language

### **Frontend**
- **React 19**: Modern React with latest features
- **TypeScript**: Type-safe JavaScript development
- **Vite**: Fast build tool and dev server
- **TailwindCSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives

### **Development Tools**
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Husky**: Git hooks for quality assurance

## 📊 Program Statistics

- **Program ID**: `4a8Lgwhx7oQZUEUHq2m3B5yZJkZXrzLthYRjn3TCRCfc`
- **Total Instructions**: 15+
- **Account Types**: 4 (User, Client, Bounty, Submission)
- **Test Coverage**: 100% (17/17 tests passing)
- **Network Support**: Localnet, Devnet, Mainnet

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### **Development Workflow**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### **Documentation**
- [Solana Documentation](https://docs.solana.com/)
- [Anchor Book](https://book.anchor-lang.com/)
- [React Documentation](https://react.dev/)

### **Community**
- [Solana Discord](https://discord.gg/solana)
- [Anchor Discord](https://discord.gg/cUf9NQk)
- [GitHub Issues](https://github.com/your-username/solearn/issues)

## 🙏 Acknowledgments

- **Solana Foundation** for the blockchain platform
- **Anchor Team** for the development framework
- **React Team** for the frontend library
- **Open Source Community** for various tools and libraries

---

**Built with ❤️ on Solana**

*For questions or support, please open an issue on GitHub.*
