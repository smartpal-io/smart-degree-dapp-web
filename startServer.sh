#!/bin/sh -x

pkill -f node
ganache-cli & 
sleep 10
truffle migrate --network development # --reset optional
npm run dev &
