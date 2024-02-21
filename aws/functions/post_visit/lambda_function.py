# import pip
import json
from xml.etree.ElementTree import tostring
# import regex
import boto3
from datetime import datetime
from sentiment import analyze
from affective_db.link import put_link
from affective_db.visit import put_visit
import hashlib


# Event should be given in the format:
'''
The visit function takes an event with a link, formatted as follows:
{
    "url": string,
    "eventTime": integer,
    "device": "android" | "ios" | "desktop",
}

Response body:
Example:
    {
        "url": string,
    }
'''
def lambda_handler(event, context):
    try:
        # Grab body from event
        if not 'body' in event:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Missing body in request'})
            }

        body = json.loads(event['body'])

        # Print information about the user
        print('Invoked by:', event['requestContext']['authorizer']['claims']['username'])
        print('sub:', event['requestContext']['authorizer']['claims']['sub'])

        url = body['url']
        event_time = body['eventTime']
        device = body['device']

        # Connect to dynamodb
        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table('affective')

        # Check if the link is already in the database
        hashed_url = hashlib.sha256(url.encode('utf-8')).hexdigest()
        date = int(event_time / 86400000) # Todays date (days since 1970-01-01)
        link_key = f'LINK#{hashed_url}#{date}'
        response = table.get_item(
            Key={
                'pk': link_key,
                'sk': link_key,
            }
        )
        if not 'Item' in response:
            # If the link is not in the database, add it
            scores = analyze(url)
            put_link(url, scores['scores'], event_time)

        # Add the visit to the database
        put_visit(event['requestContext']['authorizer']['claims']['sub'], link_key, event_time, device)


        return {
            'statusCode': 200,
            'body': json.dumps({
                'user': event['requestContext']['authorizer']['claims']['sub'],
                'link': url,
                'accessTime': event_time,
                'device': device,
            })
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': str(e)
            })
        }