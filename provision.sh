#!/bin/bash

rm -rf schemas/db
rm jobs/*
mkdir schemas/db

curl -X POST http://localhost:5000/challenges --data-ascii '{"questions": [{"question": "What did you spend today?", "answer": ""}]}' -H "Content-Type: application/json"

curl -X POST http://localhost:5000/challenges --data-ascii '{"questions": [{"question": "What is your marginal tax rate?", "answer": ""}]}' -H "Content-Type: application/json"

curl -X POST http://localhost:5000/challenges --data-ascii '{"questions": [{"question": "What is your take home pay?", "answer": ""}]}' -H "Content-Type: application/json"

curl -X POST http://localhost:5000/challenges --data-ascii '{"questions": [{"question": "What did you buy?", "answer": ""}, {"question": "At what price did you buy at?", "answer": ""}, {"question": "When did you buy it?", "answer": ""},{"question": "How many units did you buy?", "answer":""}]}' -H "Content-Type: application/json"

curl -X POST http://localhost:5000/facts --data-ascii '{"description": "Your take home pay is", "value": "£2000", "dependencies": [{"path": "", "question": "What is your gross salary?", "answer": "44000"}, {"question": "What is your marginal tax rate?", "answer": "27%"}]}' -H "Content-Type: application/json"
