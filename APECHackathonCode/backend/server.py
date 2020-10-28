from flask import Flask
from flask import request
from flask_cors import CORS, cross_origin
from ast import literal_eval

app = Flask(__name__)

cors = CORS(app)

@app.route('/analyzeCustomerData', methods = ['POST', 'GET'])
def analyzeCustomerData():
    post_data = (literal_eval(request.data.decode('utf8')))
    return "Successfully Analyzed"