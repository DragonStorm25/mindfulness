# Cognito post-confirmation trigger 
#

import json
import boto3

def lambda_handler(event, context):
    # User in DynamoDB needs: 
    print('Adding user to DynamoDB')
    print(event)

    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('affective')

    print('Connected to DynamoDB table')

    try:

        # Get user info from event
        user = event['request']['userAttributes']
        print(user)

        # Required fields, throws KeyError if not present
        email = user['email']
        dob = user['birthdate']
        first_name = user['given_name']
        last_name = user['family_name']
        sub = user['sub']
        username = event['userName']

        # Nullable fields
        phone = user.get('phone_number', None)

        print('Got all user info:')
        print({
            'email': email,
            'dob': dob,
            'first_name': first_name,
            'last_name': last_name,
            'phone': phone,
            'sub': sub,
            'username': username
        })

        # Add user to table
        table.put_item(
            Item={
                'pk': 'USER#'+sub,
                'sk': 'USER#'+sub,
                'email': email,
                'dob': dob,
                'first_name': first_name,
                'last_name': last_name,
                'phone': phone,
                'sub': sub,
                'username': username
            }
        )

        context.done()

        return event
    except Exception as e:
        print(e)
        return event