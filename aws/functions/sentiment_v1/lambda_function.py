# import pip
import json
from xml.etree.ElementTree import tostring
from bs4 import BeautifulSoup
import requests
# import regex
import re
import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from nltk.tokenize import word_tokenize

nltk.data.path.append("/tmp")

nltk.download("punkt", download_dir = "/tmp")
# nltk.download('stopwords', download_dir='/tmp')

"""load the vader lexicon for sentiment analysis"""


sia = SentimentIntensityAnalyzer(lexicon_file='vader_lexicon/vader_lexicon.txt')

stopwords = {'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', "you're", "you've", "you'll", "you'd", 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', "she's", 'her', 'hers', 'herself', 'it', "it's", 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', "that'll", 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', "don't", 'should', "should've", 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren', "aren't", 'couldn', "couldn't", 'didn', "didn't", 'doesn', "doesn't", 'hadn', "hadn't", 'hasn', "hasn't", 'haven', "haven't", 'isn', "isn't", 'ma', 'mightn', "mightn't", 'mustn', "mustn't", 'needn', "needn't", 'shan', "shan't", 'shouldn', "shouldn't", 'wasn', "wasn't", 'weren', "weren't", 'won', "won't", 'wouldn', "wouldn't"}

def getdata(url):
    """
    Gets text from given url
    """
    r = requests.get(url)
    return r.text

def text_preprocessing(text):
    text = text.lower()
    text = re.sub("@\\w+", "", text)
    text = re.sub("https?://.+", "", text)
    text = re.sub("\\d+\\w*\\d*", "", text)
    text = re.sub("#\\w+", "", text)
    return(text)

# Event should be given in the format:
'''
This sentiment Lambda function takes as input a JSON object.
Example:
    {
        "links": ["https://www.google.com", "https://www.facebook.com"]
    }
Returns a JSON object with the links and the sentiment scores.
Example:
    {
        "links": ["https://www.google.com", "https://www.facebook.com"],
        "scores": {
            "usefulness": [0.5, 0.2],
            "emotion": [0.5, 0.2],
            "knowledge": [0.5, 0.2]
        }
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
        
        # Event type validation
        if not 'links' in body:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Missing links in event'})
            }
        if not isinstance(body['links'], list):
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Links must be a list'})
            }

        url_list = body['links']


        scores = {
            'emotion': [],
            'usefulness': [],
            'knowledge': []
        }
        for url in url_list:
            try:
                html = getdata(url)
                soup = BeautifulSoup(html, 'html.parser')
                
                paragraph = []
                for data in soup.find_all("p"):
                    sentence = data.get_text()

                    sentence = text_preprocessing(sentence)

                    text_tokens = word_tokenize(sentence)

                    tokens_without_sw = [word for word in text_tokens if not word in stopwords]
                    filtered_sentence = (" ").join(tokens_without_sw)
                    paragraph.append(filtered_sentence)
                    if len(paragraph) > 500:
                        break
                paragraph = ' '.join(paragraph)
                score = sia.polarity_scores(paragraph)['compound']
                scores['emotion'].append(score)
            except Exception as e:
                scores['emotion'].append(-1)
        
        # Temporary until usefulness, knowledge scores are added
        scores['usefulness'] = [-1] * len(url_list)
        scores['knowledge'] = [-1] * len(url_list)

        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Methods': '*'
            },
            'body': json.dumps({
                'links': url_list,
                'scores': scores,
                'test': 'hello'
            })
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': str(e)
            })
        }