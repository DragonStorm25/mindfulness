import json

'''

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

        # # Print information about the user
        # print('Invoked by:', event['requestContext']['authorizer']['claims']['username'])
        # print('sub:', event['requestContext']['authorizer']['claims']['sub'])

        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Hello from Lambda!',
            })
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': str(e)
            })
        }