#!/bin/sh -x

pkill -f node
ganache-cli --mnemonic "cotton bid waste motion drink found shuffle pulp milk maximum sheriff express" > ganache.log &
sleep 10
truffle migrate --network development > truffle.log

VAL=$(more truffle.log | grep "SmartDegree:" | cut -d: -f2 | tr -d ' ')
sed -i "s/^\(CONTRACT_ADDRESS\s*=\s*\).*\$/\1$VAL/" .env

npm run dev > npm.log &
