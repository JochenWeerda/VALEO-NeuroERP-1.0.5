#!/bin/bash

echo "Starte Microservice Observer und Performance Optimizer..."
echo

cd backend
python3 start_observer.py "$@"

echo
echo "Observer beendet." 