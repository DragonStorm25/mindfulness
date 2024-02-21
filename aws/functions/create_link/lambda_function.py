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
import boto3
import hashlib
from datetime import datetime
from decimal import Decimal

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

def lambda_handler(event, context):
    try:
        url = event['url']

        scores = {
            'emotion': -1,
            'usefulness': -1,
            'knowledge': -1
        }

        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table('affective')

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
            scores['emotion'] = score
        except Exception as e:
            print('Failed to get emotion score for link: ', str(e))

        # Hash the url to get an id
        hashed_url = hashlib.sha256(url.encode('utf-8')).hexdigest()
        # Todays date (days since 1970-01-01)
        date = int(datetime.now().timestamp() / 86400)
        key = f'LINK#{hashed_url}#{date}'

        # Add to database
        table.put_item(
            Item={
                'pk': key,
                'sk': key,
                'link': url,
                # Cast to Decimal to avoid boto3 error
                # casting the float to str is necessary to avoid "inexact" error
                'emotion': Decimal(str(scores['emotion'])),
                'usefulness': Decimal(str(scores['usefulness'])),
                'knowledge': Decimal(str(scores['knowledge']))
            }
        )

        return {
            'link': url,
            'scores': scores,
            'key': key,
        }
    except Exception as e:
        return {
            'error': str(e)
        }