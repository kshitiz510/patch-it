# PatchIt Production Readiness Notes

## Architecture

```text
React/Vite Frontend
  -> Express API with JWT auth
  -> MongoDB collections: users, locations/reports, mlpredictions, bids, repaircontracts, communityposts, auditlogs
  -> Django ML API when ML_API_URL is configured
  -> MetaMask/Web3 -> TenderBidding smart contract on Hardhat or Sepolia
```

## Database Schema

- `users`: name, email, passwordHash, role, reputation, completedContracts, walletAddress, refreshTokenHash.
- `locations`: reporter, media paths, coordinates, status, severity, estimatedArea, estimatedCost, confidence, credibilityScore, duplicates, confirmations.
- `mlpredictions`: report, modelName, severity, estimatedArea, estimatedCost, confidence, detections, source.
- `bids`: report, contractor, walletAddress, amount, timelineDays, txHash, riskScore, recommendedAction, rankingScore, status.
- `repaircontracts`: report, bid, contractor, amount, projectKey, txHash, status.
- `communityposts`: author, body, linked report, likes, comments/replies.
- `auditlogs`: actor, action, entity type/id, metadata.

## Smart Contract

Contract: `blockchain/contracts/TenderBidding.sol`

States:

```text
Reported -> OpenForBidding -> BidSelected -> WorkInProgress -> Completed -> Verified -> PaymentReleased
```

Functions:

- `createProject(reportId, locationKey, estimatedCost)`
- `registerContractor()`
- `submitBid(projectKey, amount, rankingScore, metadataURI)`
- `selectWinner(projectKey, contractor)`
- `markWorkStarted(projectKey)`
- `markCompleted(projectKey)`
- `verifyCompletion(projectKey)`
- `releaseFunds(projectKey)`

Events:

- `ProjectCreated`
- `BidPlaced`
- `WinnerSelected`
- `WorkStarted`
- `WorkCompleted`
- `CompletionVerified`
- `PaymentReleased`

## ML Pipeline

Endpoint: `POST /api/detect/`

Output:

```json
{
  "severity": "medium",
  "estimatedArea": 2.4,
  "estimatedCost": 33000,
  "confidence": 0.74,
  "detections": []
}
```

If trained YOLO weights exist, the Django service uses them. If weights are unavailable, the service and backend use a deterministic media estimator so uploads still receive severity, area, cost, and confidence.

Bid fraud endpoint:

```text
POST /api/validate-bid/
```

Returns `isSuspicious`, `riskScore`, and `recommendedAction`.

## API Summary

Auth:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`

Reports:

- `POST /upload`
- `GET /locations`
- `GET /reports/:id`
- `PATCH /reports/:id/status`
- `POST /reports/:id/confirm`
- `POST /reports/:id/open-bidding`

Community:

- `GET /community/posts`
- `POST /community/posts`
- `POST /community/posts/:id/like`
- `POST /community/posts/:id/comments`

Bidding:

- `GET /marketplace/reports`
- `POST /bids`
- `GET /bids`
- `POST /contracts/select-winner`
- `GET /contracts`
- `PATCH /contracts/:id/status`

Wallet:

- `POST /wallets`

Dev seed:

- `POST /dev/seed-test-accounts`

## Test Accounts

Use the seed endpoint locally:

```powershell
Invoke-WebRequest -Method POST http://localhost:4000/dev/seed-test-accounts
```

Credentials:

```text
Citizen:    citizen@patchit.local    Citizen123!
Contractor: contractor@patchit.local Contractor123!
Admin:      admin@patchit.local      Admin123!
```

## MetaMask Setup

Local Hardhat:

```text
RPC URL: http://127.0.0.1:8545
Chain ID: 31337
Currency: ETH
```

Import a private key printed by `npx hardhat node`.

Sepolia:

- Set `SEPOLIA_RPC_URL`.
- Set `PRIVATE_KEY`.
- Deploy with `npx hardhat run scripts/deploy.js --network sepolia`.

## Local Deployment

```powershell
cd backend
npm start
```

```powershell
cd frontend
npm run dev
```

```powershell
cd blockchain
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
```

Optional ML:

```powershell
cd ml
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python manage.py runserver 8000
```

Set backend `.env`:

```env
ML_API_URL=http://localhost:8000
AUTH_SECRET=replace-this
```

## Verified Tests

- Backend: `npm test`
- Frontend: `npm run build`
- Frontend lint: `npm run lint` has warnings only.
- Blockchain: `npx hardhat test`

## Feature Matrix

| Feature | Status |
| --- | --- |
| Signup/login/JWT refresh | Implemented and tested |
| Protected report/community/bid routes | Implemented |
| Image/video report upload | Implemented |
| Auto/manual location | Implemented in UI |
| Database report storage | Implemented |
| Map from live database reports | Implemented |
| ML severity/area/cost/confidence | Implemented with YOLO path plus deterministic fallback |
| Community feed/comments/replies/likes | Implemented |
| Credibility score | Implemented |
| Contractor marketplace | Implemented |
| Bid reasonability scoring | Implemented and tested |
| Contract allocation ranking | Implemented |
| Smart contract project lifecycle | Implemented and tested |
| Payment release | Implemented in contract |

## Remaining Limitations

- A trained YOLO segmentation model is still required for real computer-vision-grade dimensions. The fallback estimator is deterministic and functional, but not a replacement for calibrated field measurement.
- Full browser E2E tests are not yet present.
- Production deployment still needs managed secrets, HTTPS, persistent object storage for media, and CI/CD.
