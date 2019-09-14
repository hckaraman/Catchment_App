from flask import Flask, jsonify, request,render_template, jsonify
import os
import numpy as np
from pysheds.grid import Grid
import fiona
import geopandas as gpd
import pyproj
import math
import catchment
import json

app = Flask(__name__)

SITE_ROOT = os.path.realpath(os.path.dirname(__file__))
data_url = os.path.join(SITE_ROOT, "data", "DEM_4326.tif")
out_url = os.path.join(SITE_ROOT, "data", "catchment.shp")

@app.route('/', methods=['POST', 'GET'], defaults={'name' : 'Default'})
@app.route('/home/<string:name>', methods=['POST', 'GET'])
def home(name):
    return render_template('test2.html')

# @app.route('/json')
# def json():
#     return jsonify({'key' : 'value', 'listkey' : [1,2,3]})

# @app.route('/query')
# def query():
#     name = request.args.get('name')
#     location = request.args.get('location')
#     return '<h1>Hi {}. You are from {}. You are on the query page!</h1>'.format(name, location)

@app.route('/theform')
def theform():
    return render_template('test2.html')

@app.route('/process')
def process():
    name = request.args.get('X', 0, type=float)
    location = request.args.get('Y', 0, type=float)
    # name = float(request.form.get('number', 0))
    # location = request.form['Y']
    x = float(name)
    y = float(location)
    Area, utm_zone, branches = catchment.catch(x,y,data_url,out_url)
    # area = [{"area": Area}]

    # return '<h1>Area is {} km2 and utm zone is {} </h1>'.format(Area,utm_zone)
    # return render_template('test2.html', area=json.dumps(area))
    return jsonify(Area=Area, UTM=utm_zone, Branch=branches)


if __name__ == '__main__':
    app.run(debug=True)