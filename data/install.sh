#!/bin/zsh
python3 -m venv venv
. venv/bin/activate
pip install boto3
pip install pandas
pip install uuid
python3 dynamodb_csv.py
