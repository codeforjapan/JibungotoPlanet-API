#!/bin/zsh
python3 -m venv venv
. venv/bin/activate
pip install boto3
pip install pandas
pip install uuid
pip install dynamodb-csv
./venv/bin/dynamodb-csv --truncate -t devJibungotoPlanet-ApilocalFootprint --profile footprint
./venv/bin/dynamodb-csv --truncate -t devJibungotoPlanet-ApichangeImpact --profile footprint
python3 dynamodb_csv.py

./venv/bin/dynamodb-csv --truncate -t devJibungotoPlanet-Apifootprint --profile footprint
./venv/bin/dynamodb-csv --truncate -t devJibungotoPlanet-Apiparameter --profile footprint
./venv/bin/dynamodb-csv -i -t devJibungotoPlanet-Apifootprint -f footprint.csv --profile footprint
./venv/bin/dynamodb-csv -i -t devJibungotoPlanet-Apiparameter -f parameter.csv --profile footprint
