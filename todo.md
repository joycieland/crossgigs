# Freelancer Gig Platform TODO

## Database & Schema
- [x] Create jobs table with title, description, category, skills, payment amount, status
- [x] Create transactions table to track USDC payments
- [x] Add database helper functions for job queries
- [x] Seed database with 5 sample jobs

## Crossmint Integration
- [x] Set up Crossmint API integration in backend
- [x] Create agent wallet on base-sepolia chain
- [x] Implement wallet balance checking function
- [x] Implement USDC token transfer function
- [x] Add error handling for blockchain operations

## Frontend - Homepage
- [x] Design elegant color palette and typography
- [x] Create job listing card component
- [x] Display 5 sample jobs with all details
- [x] Build Community Pool section with wallet address and balance
- [x] Add responsive layout for mobile and desktop

## Payment Flow
- [x] Add "Done" button to each job card
- [x] Create payment confirmation dialog
- [x] Add wallet address input field with validation
- [x] Implement USDC transfer on confirmation
- [x] Display transaction hash after successful payment
- [x] Show loading states during blockchain operations

## Completed Jobs Section
- [x] Create completed jobs section on homepage
- [x] Move jobs to completed section after payment
- [x] Display transaction hash for each completed job
- [x] Add visual distinction between active and completed jobs

## Backend API (tRPC)
- [x] Create jobs router with list and complete procedures
- [x] Create wallet router for balance and transfer operations
- [x] Add proper error handling and validation
- [x] Write vitest tests for critical flows

## Testing & Deployment
- [x] Test complete job flow end-to-end
- [ ] Verify USDC transfers on base-sepolia (requires API key)
- [x] Test error scenarios (insufficient balance, invalid address)
- [ ] Create final checkpoint for deployment
