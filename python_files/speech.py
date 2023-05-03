#The python file to perform Machine Learning model training from input speech to predict stress or no stress
# import necessary libraries
import speech_recognition as sr
import pandas as pd
import numpy as np
import nltk
import re
import pymongo
from pymongo import MongoClient
import json

#Connect to mongoDB database
cluster = MongoClient("mongodb+srv://lhn15:Anhminhbin2@cluster0.mxykocz.mongodb.net/?retryWrites=true&w=majority")
db = cluster["test"]
collection = db["user-results"]

#Read the data to train the model from a csv file
data = pd.read_csv("dreaddit-train.csv")
data = data[['subreddit', 'text', 'label']]

#Clean the data
nltk.download('stopwords')
stemmer = nltk.SnowballStemmer("english")
from nltk.corpus import stopwords
import string
stopword=set(stopwords.words('english'))
def dataCleaning(inputt):
    inputt = str(inputt).lower()
    inputt = re.sub('\w*\d\w*', '', inputt)
    inputt = re.sub('\[.*?\]', '', inputt)
    inputt = re.sub('<.*?>+', '', inputt)
    inputt = re.sub('\n', '', inputt)
    inputt = re.sub('https?://\S+|www\.\S+', '', inputt)
    inputt = re.sub('[%s]' % re.escape(string.punctuation), '', inputt)
    result = []
    for word in inputt.split(' '):
        if word not in stopword:
            result.append(word)
    result= " ".join(result)
    return result
data["text"] = data["text"].apply(dataCleaning)

from wordcloud import STOPWORDS
text = " ".join(i for i in data.text)
stopwords = set(STOPWORDS)

#Choose the text column and the label column to train
data["label"] = data["label"].map({0: "No Stress", 1: "Stress"})
data = data[["text", "label"]]

from sklearn.feature_extraction.text import CountVectorizer
from sklearn.model_selection import train_test_split

#Vectorize the columns and build the ML model to predict the data
x = np.array(data["text"])
y = np.array(data["label"])
cv = CountVectorizer()
X = cv.fit_transform(x)
xtrain, xtest, ytrain, ytest = train_test_split(X, y, 
                                                test_size=0.2, 
                                                )
from sklearn.naive_bayes import BernoulliNB
model = BernoulliNB()
model.fit(xtrain, ytrain)

#Get the speech from the user, analyze and return the result
recognize = sr.Recognizer()
try:
    with sr.Microphone() as source:
        audio_data = recognize.record(source, duration=12)
        text = recognize.recognize_google(audio_data)
    user = text
    data = cv.transform([user]).toarray()
    #Use the trained model to predict the outcome
    output = model.predict(data)
    #Return the result
    record = {"Input": user, "Result": output[0]}
    collection.insert_one(record)
    print(output[0])
#When the user does not speak 
except:
    record = {"Input": "No input", "Result": "No Stress"}
    collection.insert_one(record)
    print('Please say something')

