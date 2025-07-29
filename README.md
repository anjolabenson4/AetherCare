# AetherCare – Decentralized Health Record Access & Consent Management

A blockchain-based platform for patient-centric health record management, providing secure, transparent, and decentralized access control to medical data.

## Overview

This system consists of multiple Clarity smart contracts that manage key aspects of healthcare data access, sharing, and automation:

1. **Patient Identity Contract** – Decentralized patient registration and identity mapping  
2. **Medical Record Index Contract** – Stores metadata and links to off-chain encrypted health data  
3. **Access Control Contract** – Manages permissions for who can access what and when  
4. **Healthcare Provider Registry Contract** – Registers and verifies medical professionals and institutions  
5. **Consent Management Contract** – Handles time-limited and purpose-bound patient data sharing  
6. **Audit Log Contract** – Maintains immutable records of access events  
7. **Insurance Claim Contract** – Automates submission, validation, and payment of claims  
8. **Prescription Validation Contract** – Enables on-chain prescription issuance and pharmacy verification  
9. **Research Tokenization Contract** – Allows opt-in, anonymized data sharing with tokenized incentives  
10. **Dispute Resolution Contract** – Manages complaints and arbitration over data access or misuse

## Features

- Patient-owned medical records  
- Fine-grained access control and revocation  
- Immutable audit trails  
- Verified healthcare provider registry  
- Smart consent contracts (purpose-based, time-limited)  
- Tokenized participation in medical research  
- Prescription fraud prevention  
- Automated insurance workflows  
- Modular and privacy-respecting by design

## Smart Contracts

### Patient Identity Contract

- Registers patients pseudonymously  
- Links identity to off-chain encrypted storage  
- Supports emergency override scenarios (configurable)

### Medical Record Index Contract

- Stores references and hashes of off-chain records (IPFS, Filecoin, etc.)  
- Verifies integrity of submitted data  
- Categorizes by diagnosis, lab reports, imaging, etc.

### Access Control Contract

- Patient-controlled permissioning system  
- Time-bound and role-based access logic  
- Emergency access triggers with logging

### Healthcare Provider Registry Contract

- Verifies and registers licensed institutions and professionals  
- Stores credentials and accreditation status  
- Manages revocation and updates

### Consent Management Contract

- Purpose-specific data sharing (e.g., diagnosis, research, audit)  
- Consent expiration and renewal flow  
- Audit-proof consent records

### Audit Log Contract

- Immutable event logging  
- Tracks who accessed what, when, and why  
- Used for patient review, legal protection, and compliance

### Insurance Claim Contract

- Allows providers to submit claims with proof from record data  
- Automatically validates and processes eligible claims  
- Integrates with payment gateways

### Prescription Validation Contract

- Physicians issue prescriptions on-chain  
- Verifiable by pharmacies without data leakage  
- Prevents prescription forgery and overuse

### Research Tokenization Contract

- Patients can opt in to anonymously share data  
- Research institutions access datasets with token incentives  
- $AETHER utility token support

### Dispute Resolution Contract

- Handles data misuse complaints  
- Facilitates community or third-party arbitration  
- Maintains outcome logs and enforces penalties

## Installation

1. Install Clarinet CLI  
2. Clone this repository  
3. Run tests:  
   ```bash
   npm run test
   ```

## Usage

Each smart contract can be deployed and used independently. Contracts interact through defined interfaces and follow a modular architecture to maintain flexibility and compliance. Refer to individual contract documentation for function-level usage and integration examples.

## Testing

Tests are written using Vitest and Clarity integration tooling. Run all tests with:

```bash
npm run test
```

## License

MIT License
