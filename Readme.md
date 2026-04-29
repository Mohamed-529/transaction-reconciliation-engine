# Transaction Reconciliation Engine

## Overview
Backend system to reconcile user and exchange transactions using tolerance-based matching.

## Features
- CSV ingestion with validation
- Raw + normalized data storage
- Intelligent matching engine
- Conflict detection
- CSV report generation

## Tech Stack
- Node.js (Express)
- MongoDB
- Docker

## How to Run

### Option 1: Without Docker
npm install
npm start

### Option 2: With Docker
docker-compose up --build

## API

### POST /api/reconcile

Request:
{
  "userFile": "./data/user_transactions.csv",
  "exchangeFile": "./data/exchange_transactions.csv"
}

## Output
- JSON response (matched results)
- CSV file generated: report.csv

## Matching Logic
- Uses time + quantity tolerance
- Uses scoring to find best match
- Detects conflicts beyond tolerance

## Edge Cases Handled
- Invalid rows
- Duplicate transactions
- Time differences
- Quantity mismatches