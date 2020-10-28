from flask import Flask
from flask import request
from flask_cors import CORS, cross_origin
from ast import literal_eval

import os, mediacloud.api
from datetime import datetime, timedelta

app = Flask(__name__)

cors = CORS(app)

@app.route('/analyzeCustomerData', methods = ['POST', 'GET'])
def analyzeCustomerData():
    post_data = (literal_eval(request.data.decode('utf8')))
    return "Successfully Analyzed"

@app.route('/getNewsUrls', methods = ['POST', 'GET'])
def getNewsUrls():
    API_KEY = '25c5b9ccc207e7f56ce93f920a0253064a3b6c4fcbde0cedd7e5145d631c49c6'
    mc = mediacloud.api.MediaCloud(API_KEY)

    post_data = (literal_eval(request.data.decode('utf8')))

    dateTimeObj = datetime.now()
    startsearch = (dateTimeObj - timedelta(days=7)).strftime("%Y-%m-%dT%H:%M:%SZ")
    stopsearch = dateTimeObj.strftime("%Y-%m-%dT%H:%M:%SZ")

    storylimit = 10
    country = post_data["country"]
    tag_id_dict = {"MYS": 38380297, "USA": 34412234}

    storylist = mc.storyList(solr_query="(title:(covid OR coronavirus OR covid-19)) AND tags_id_media:{0}".format(tag_id_dict[country]),
                             solr_filter="publish_day:[{0} TO {1}]".format(startsearch, stopsearch),
                             rows=storylimit)
    output = {}
    for index, value in enumerate(storylist):
        output[index] = value["url"]
    return output

app.run();

