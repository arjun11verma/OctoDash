from flask import Flask
from flask import request
from flask_cors import CORS, cross_origin
from ast import literal_eval

import os, mediacloud.api
from datetime import datetime, timedelta

import requests, json

import numpy as np

import tensorflow.compat.v1 as tf
tf.disable_v2_behavior()
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score as r2
from sklearn.preprocessing import StandardScaler, MinMaxScaler
import pandas as pd

app = Flask(__name__)

cors = CORS(app)


@app.route('/analyzeCustomerData', methods=['POST', 'GET'])
def analyzeCustomerData():
    post_data = (literal_eval(request.data.decode('utf8')))
    return "Successfully Analyzed"


@app.route('/predictWeek', methods=['POST', 'GET'])
def predictWeek():
    testset = {"10/14/20":{"cases":0,"deaths":0,"recovered":0},"10/15/20":{"cases":589,"deaths":3,"recovered":409},"10/16/20":{"cases":629,"deaths":6,"recovered":245},"10/17/20":{"cases":869,"deaths":4,"recovered":302},"10/18/20":{"cases":871,"deaths":7,"recovered":701},"10/19/20":{"cases":865,"deaths":3,"recovered":455},"10/20/20":{"cases":862,"deaths":3,"recovered":634},"10/21/20":{"cases":732,"deaths":6,"recovered":580},"10/22/20":{"cases":847,"deaths":5,"recovered":486},"10/23/20":{"cases":710,"deaths":10,"recovered":467},"10/24/20":{"cases":1228,"deaths":7,"recovered":671},"10/25/20":{"cases":823,"deaths":8,"recovered":579},"10/26/20":{"cases":1240,"deaths":7,"recovered":691},"10/27/20":{"cases":835,"deaths":2,"recovered":674}}
    x, y = [], []
    count = 0
    for key in reversed(testset.keys()):
        x.append(count)
        y.append(testset[key]["cases"])
        count += 1

    alpha = 0.15
    epochs = 400
    errors = []
    m = len(testset)
    x = np.array(x).reshape((len(x), 1))
    y = np.array(y).reshape((len(y), 1))

    x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.2)

    scaler = StandardScaler().fit(x_train)
    x_train = scaler.transform(x_train)
    x_test = scaler.transform(x_test)

    X = tf.placeholder(tf.float32, shape=[None, 1], name='x-input')
    Y = tf.placeholder(tf.float32, shape=[None, 1], name='y-input')

    theta_1 = tf.Variable(tf.zeros([1, 1]))
    theta_2 = tf.Variable(tf.zeros([1, 1]))
    theta_3 = tf.Variable(tf.zeros([1, 1]))

    model = tf.matmul(tf.pow(X, 2), theta_1) + tf.matmul(X, theta_2) + theta_3

    cost = tf.reduce_sum(tf.square(Y-model))/(2*m)

    optimizer = tf.train.GradientDescentOptimizer(alpha).minimize(cost)

    init = tf.global_variables_initializer()

    with tf.Session() as sess:
        sess.run(init)
        for i in range(epochs):
            sess.run(optimizer, feed_dict={X:x_train, Y:y_train})
            loss = sess.run(cost, feed_dict={X:x_train, Y:y_train})
            errors.append(loss)
        theta1, theta2, theta3 = sess.run([theta_1, theta_2, theta_3])

    #plt.plot(list(range(epochs)), errors)
    #plt.title("Cost vs Iteration")
    #plt.show()

    b = scaler.transform(x)
    pred = theta1 * b**2 + theta2 * b + theta3

    #plt.plot(x, pred, 'red', label="Prediction")
    #plt.plot(x, y, 'blue', label="True Values")
    #plt.legend()
    #plt.title("Salary vs Position")
    #plt.show()
    predicted = []
    for z in range(m, m + 7):
        predicted.append(theta1 * z**2 + theta2 * z + theta3)
    print(predicted)


    print("R2 Correlation: ", r2(y, pred))

    # work in progress

    return "done"


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
