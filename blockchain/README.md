# Blockchain — TenderBidding Smart Contract

**Solidity + Hardhat + ethers.js v6 + Chai**

This directory contains the smart contract for transparent, decentralized tender bidding on the Ethereum blockchain.

---

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Local Blockchain

```bash
npx hardhat node
```

This starts a local Ethereum network at `http://127.0.0.1:8545/` with 20 test accounts (10,000 ETH each).

### 3. Run Tests

In another terminal:

```bash
npx hardhat test
```

**Expected Output**:

```
  TenderBidding Contract
    Admin Management
      ✔ should allow creating admin
      ✔ should prevent duplicate admin
    Bidder Registration
      ✔ should register new bidder
      ✔ should prevent duplicate bidder registration
    Tender Management
      ✔ should create tender (admin only)
      ✔ should prevent non-admin from creating tender
      ✔ should prevent duplicate tender
    Bidding Process
      ✔ should place valid bid
      ✔ should prevent unregistered bidder from bidding
      ✔ should prevent bid exceeding 110% of base amount
      ✔ should track lowest bid and winner
    Tender Closure
      ✔ should close tender (admin only)
      ✔ should prevent non-admin from closing
      ✔ should prevent bidding on closed tender
    Tender Queries
      ✔ should retrieve all tenders
      ✔ should get tender by key

  16 passing (2s)
```

### 4. Compile Contracts

```bash
npx hardhat compile
```

Generates contract artifacts in `artifacts/contracts/` (ABI + bytecode).

### 5. Deploy to Localhost

```bash
npx hardhat run scripts/deploy.js --network localhost
```

**Output**:

```
🚀 Starting deployment...
📋 Deploying contracts with account: 0xf39Fd...
⏳ Deploying TenderBidding contract...
✅ TenderBidding deployed to: 0x5FbD...
💾 Deployment saved to: deployments/localhost-deployment.json
```

---

## Project Structure

```
blockchain/
├── contracts/
│   ├── TenderBidding.sol    # Main smart contract
│   └── Migrations.sol       # Deployment helper
├── scripts/
│   └── deploy.js            # Hardhat deployment script
├── test/
│   └── TenderBidding.test.js # Test suite (Chai + ethers.js)
├── artifacts/               # Compiled contracts (generated)
├── cache/                   # Hardhat cache (generated)
├── hardhat.config.js        # Hardhat configuration
├── .env.example             # Environment template
├── package.json
└── README.md
```

---

## Smart Contract: TenderBidding

### Overview

**TenderBidding** implements a transparent, blockchain-based tender system for road repair work:

1. **Admins** create tenders for pothole repair at specific locations (latitude + longitude)
2. **Bidders** register and place bids for tenders
3. **Automator** selects the lowest valid bid and appoints the winner
4. All transactions are immutable and permanent on the blockchain

### Key Functions

#### Admin Management

```solidity
createAdmin(string memory _name)
```

Grants admin privileges to the caller (one admin per transaction sender).

#### Bidder Registration

```solidity
registerBidder(string memory _name)
```

Registers a bidder to participate in tenders.

#### Tender Management

```solidity
createTender(string memory _latitude, string memory _longitude, uint256 _baseAmount)
```

Creates a new tender at the given coordinates (lat/lon) with a base cost estimate. Only admins can create.

```solidity
getAllTenders() returns (string[] memory)
getTender(string memory _tenderKey) returns (Tender)
```

Query tenders by key (format: `"{latitude}_{longitude}"`).

#### Bidding

```solidity
placeBid(string memory _tenderKey, uint256 _bidAmount)
```

Place a bid for a tender. Bid must be ≤ 110% of base amount and the tender must be open.

#### Tender Closure

```solidity
closeTender(string memory _tenderKey)
```

Closes a tender and awards it to the lowest bidder. Only admins can close.

### Data Structures

```solidity
struct Tender {
    string uniqueKey;        // "latitude_longitude"
    bool isClosed;
    address winner;          // Winning bidder address
    uint256 lowestBid;       // Winning bid amount
    uint256 baseAmount;      // Estimated repair cost
    Bidder[] bids;           // All bids for this tender
}

struct Bidder {
    string name;             // Bidder name
    uint256 amount;          // Bid amount
}
```

---

## Configuration

### hardhat.config.js

**Networks**:

- `hardhat`: Built-in test network (auto-runs for tests)
- `localhost`: Manual node at `127.0.0.1:8545` (for `npx hardhat node`)
- `sepolia`: Sepolia testnet (requires `SEPOLIA_RPC_URL` in `.env`)

**Compiler**:

- Solidity `0.8.0`
- Optimizer: 200 runs

### .env (for Testnet Deployment)

```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
PRIVATE_KEY=your_private_key_here
```

> ⚠️ **Never commit `.env` with real private keys!** Use `.env.example` as a template.

---

## Testing

### Run Tests

```bash
npx hardhat test
```

### Run Specific Test Suite

```bash
npx hardhat test --grep "Admin Management"
```

### Generate Coverage Report

```bash
npx hardhat test --coverage
```

### Test File Structure

Tests are in `test/TenderBidding.test.js` using:

- **Mocha** (test framework)
- **Chai** (assertions: `expect()`)
- **ethers.js v6** (contract interaction)

Example test:

```javascript
it("should allow creating admin", async function () {
  const adminName = await tenderBidding.bidderNames(owner.address);
  expect(adminName).to.equal("Admin Owner");
});
```

---

## Deployment

### Localhost (for Development)

```bash
# Terminal 1: Start node
npx hardhat node

# Terminal 2: Deploy
npx hardhat run scripts/deploy.js --network localhost
```

Deployment info is saved to `deployments/localhost-deployment.json`.

### Sepolia Testnet

1. Get testnet ETH from [Sepolia Faucet](https://www.sepoliafaucet.com/)
2. Create `.env`:
   ```env
   SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
   PRIVATE_KEY=your_private_key
   ```
3. Deploy:
   ```bash
   npx hardhat run scripts/deploy.js --network sepolia
   ```

---

## Integration with Frontend

After deployment, the contract address is saved to `deployments/{network}-deployment.json`.

Update `frontend/src/blockchain/contract.js`:

```javascript
export const TENDER_BIDDING_ADDRESS = "0x5FbDB..."; // From deployment output
```

The frontend uses Web3.js to call contract functions via MetaMask.

---

## Commands Reference

| Command                                                 | Purpose                   |
| ------------------------------------------------------- | ------------------------- |
| `npm install`                                           | Install dependencies      |
| `npx hardhat node`                                      | Start local test network  |
| `npx hardhat compile`                                   | Compile contracts         |
| `npx hardhat test`                                      | Run test suite            |
| `npx hardhat run scripts/deploy.js`                     | Deploy to localhost       |
| `npx hardhat run scripts/deploy.js --network sepolia`   | Deploy to Sepolia testnet |
| `npx hardhat clean`                                     | Clear artifacts & cache   |
| `npx hardhat accounts`                                  | List test accounts        |
| `npx hardhat verify --network sepolia <address> <args>` | Verify on Etherscan       |

---

## Security Notes

⚠️ **This is a demonstration contract, not production-ready.**

Before deploying to mainnet:

1. **Audit**: Have a professional security firm audit the contract
2. **Access Control**: Use OpenZeppelin's `Ownable` or `AccessControl`
3. **Reentrancy**: Add reentrancy guards if contract holds funds
4. **Events**: Emit events for all state changes
5. **Tests**: Expand test coverage (currently 16 tests)
6. **Gas**: Optimize for gas costs

---

## Troubleshooting

### "Module not found: hardhat"

```bash
npm install
```

### "Port 8545 already in use"

```bash
# Find and kill process
lsof -i :8545 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Or use a different port
npx hardhat node --port 8546
```

### Tests hang

```bash
# Clear cache and retry
npx hardhat clean && npx hardhat test
```

### Contract compilation fails

```bash
# Check syntax
npx hardhat compile --verbose
```

---

## Links

- [Hardhat Docs](https://hardhat.org/docs)
- [ethers.js v6 Docs](https://docs.ethers.org/v6/)
- [Solidity Docs](https://docs.soliditylang.org/)
- [Chai Assertions](https://www.chaijs.com/api/bdd/)

---

## License

MIT
