#!/bin/bash

# Test script for Coverage API with specific parameters

BASE_URL="http://localhost:8080"

echo "Testing Coverage API with real parameters..."
echo "============================================="

# Test coverage map with the parameters from your log
echo "Testing coverage map..."
curl -s "$BASE_URL/api/v1/coverage/map?provider=gitlab&repoID=126830&sha=848944fc79d977d4d4d578535418d48727c39af9" | jq '.["src/pages/hoteldetail/detail/atoms/roomLayerAtom/index.ts"]' || echo "Coverage map test failed"
echo ""

# Test coverage summary map
echo "Testing coverage summary map..."
curl -s "$BASE_URL/api/v1/coverage/summary/map?provider=gitlab&repoID=126830&sha=848944fc79d977d4d4d578535418d48727c39af9" | jq '.["src/pages/hoteldetail/detail/atoms/roomLayerAtom/index.ts"]' || echo "Coverage summary map test failed"
echo ""

echo "Coverage API testing completed!"