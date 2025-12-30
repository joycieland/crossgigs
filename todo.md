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
- [x] Create final checkpoint for deployment

## Bug Fixes
- [x] Fix Crossmint wallet creation API error
- [x] Update API endpoint and authentication method
- [x] Test wallet creation with correct credentials
- [x] Fix staging vs production API URL detection
- [x] Fix email address validation for wallet owner

## Payment Adjustments
- [x] Lower job payment amounts to fit within 9.5 USDC budget
- [x] Update seed script with new payment amounts
- [x] Verify total payments are under available balance (Total: 9.5 USDC = 2.0 + 2.5 + 1.2 + 2.3 + 1.5)

## UX Improvements
- [x] Implement dynamic balance refresh after USDC transfer
- [x] Invalidate wallet query cache to trigger balance update
- [x] Show updated balance immediately after payment

## Transaction Verification
- [x] Make transaction hash clickable in success toast
- [x] Link to BaseScan explorer (https://sepolia.basescan.org/tx/[hash])
- [x] Make transaction hash clickable in completed jobs section

## Critical Bugs
- [x] Fix "Failed to create or get wallet" error preventing page load
- [x] Debug Crossmint API integration issue
- [x] Ensure wallet creation works with staging API key
- [x] Implement GET before POST pattern to avoid duplicate wallet creation errors

## Transaction Hash Bug
- [x] Fix incorrect transaction hash being displayed
- [x] Verify Crossmint API response structure for transaction hash
- [x] Ensure correct hash field is extracted and stored in database (polling for txId)
- [ ] Test that displayed hash matches actual blockchain transaction

## Proof of Work Submission Feature
- [x] Add submission fields to jobs table (submissionUrl, submissionDescription, submissionFiles)
- [x] Update database schema and push migrations
- [x] Update backend to handle submission data
- [x] Replace "Mark as Done" with "Submit Work" button
- [x] Create submission dialog with link input and description
- [x] Display submission preview in completed jobs section
- [x] Show deliverable links in completed jobs cards
- [x] Test complete submission and payment flow
