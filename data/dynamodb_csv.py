import boto3
import pandas as pd
from decimal import Decimal
from uuid import uuid4

# DynamoDBへの接続設定
my_session = boto3.Session(profile_name='footprint')
dynamodb = my_session.resource('dynamodb', region_name='ap-northeast-1')
footprint_table = dynamodb.Table('devJibungotoPlanet-ApilocalFootprint')
change_impact_table = dynamodb.Table('devJibungotoPlanet-ApichangeImpact')

# CSVファイルの読み込み
footprint_csv_file_path = './CityCarbonFootprints.csv'
change_impact_csv_file_path = './CityLifestyleChangeImpacts.csv'
footprint_df = pd.read_csv(footprint_csv_file_path)

# CSVの各行をDynamoDBに挿入
for index, row in footprint_df.iterrows():
    item = row.to_dict()
    item['Id'] = str(index + 1)
    for key, value in item.items():
        if isinstance(value, float):
            item[key] = Decimal(str(value))

    footprint_table.put_item(Item=item)

change_impact_df = pd.read_csv(change_impact_csv_file_path)
for index, row in change_impact_df.iterrows():
    item = row.to_dict()
    item['Id'] = str(index + 1)
    for key, value in item.items():
        if isinstance(value, float):
            item[key] = Decimal(str(value))

    change_impact_table.put_item(Item=item)

