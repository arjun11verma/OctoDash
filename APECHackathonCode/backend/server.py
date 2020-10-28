from flask import Flask
from flask import request
from flask_cors import CORS, cross_origin
from ast import literal_eval

import os, mediacloud.api
from datetime import datetime, timedelta

import requests, json

import tensorflow as tf

app = Flask(__name__)

cors = CORS(app)


@app.route('/analyzeCustomerData', methods=['POST', 'GET'])
def analyzeCustomerData():
    post_data = (literal_eval(request.data.decode('utf8')))
    return "Successfully Analyzed"


@app.route('/predictWeek', methods=['POST', 'GET'])
def predictWeek():
    return "Analyzed"


@app.route('/covidData', methods=['POST', 'GET'])
def covidData():
    post_data = (literal_eval(request.data.decode('utf8')))

    country = post_data["country"]
    payload = {"lastdays": 14}
    r = requests.get('https://disease.sh/v3/covid-19/historical/{0}'.format(country), params=payload)
    json_data = json.loads(r.text)

    output = {}
    startdate = list(json_data["timeline"]["cases"].keys())[0]
    cases = json_data["timeline"]["cases"][startdate]
    deaths = json_data["timeline"]["deaths"][startdate]
    recovered = json_data["timeline"]["recovered"][startdate]
    for key in json_data["timeline"]["cases"].keys():
        output[key] = {"cases": json_data["timeline"]["cases"][key] - cases,
                       "deaths": json_data["timeline"]["deaths"][key] - deaths,
                       "recovered": json_data["timeline"]["recovered"][key] - recovered}
        cases = json_data["timeline"]["cases"][key]
        deaths = json_data["timeline"]["deaths"][key]
        recovered = json_data["timeline"]["recovered"][key]
    return output


@app.route('/getNewsUrls', methods=['POST', 'GET'])
def getNewsUrls():
    post_data = (literal_eval(request.data.decode('utf8')))

    API_KEY = '25c5b9ccc207e7f56ce93f920a0253064a3b6c4fcbde0cedd7e5145d631c49c6'
    mc = mediacloud.api.MediaCloud(API_KEY)

    dateTimeObj = datetime.now()
    startsearch = (dateTimeObj - timedelta(days=7)).strftime("%Y-%m-%dT%H:%M:%SZ")
    stopsearch = dateTimeObj.strftime("%Y-%m-%dT%H:%M:%SZ")

    storylimit = 10
    country = post_data["country"]
    tag_id_dict = {"MYS": 38380297, "USA": 34412234}

    storylist = mc.storyList(
        solr_query="(title:(covid OR coronavirus OR covid-19)) AND tags_id_media:{0}".format(tag_id_dict[country]),
        solr_filter="publish_day:[{0} TO {1}]".format(startsearch, stopsearch),
        rows=storylimit)
    output = {}
    for index, value in enumerate(storylist):
        output[index] = value["url"]
    return output


app.run();
