from flask import Flask, jsonify, request, render_template, jsonify, send_file, send_from_directory
import os
import catchment
import whtroutine

app = Flask(__name__)

SITE_ROOT = os.path.realpath(os.path.dirname(__file__))
data_url = os.path.join(SITE_ROOT, "data", "DEM_4326.tif")
out_url = os.path.join(SITE_ROOT, "data", "process")
out_url2 = os.path.join(SITE_ROOT, "static")


@app.route('/', methods=['POST', 'GET'], defaults={'name': 'Default'})
@app.route('/home/<string:name>', methods=['POST', 'GET'])
def home(name):
    return render_template('Main.html')


@app.route('/theform')
def theform():
    return render_template('Main.html')


@app.route('/process')
def process():
    River = request.args.get('River', 0, type=float)
    x1 = request.args.get('X1', 0, type=float)
    y1 = request.args.get('Y1', 0, type=float)
    x2 = request.args.get('X2', 0, type=float)
    y2 = request.args.get('Y2', 0, type=float)
    # name = float(request.form.get('number', 0))
    # location = request.form['Y']

    whtroutine.toshape(out_url, x1, y1, x2, y2)
    brnch, Horton, Strahler = whtroutine.clip(data_url, out_url, out_url2, River)
    # Area, utm_zone, branches, poly = catchment.catch(x1, y1, x2, y2, data_url, out_url)
    # return jsonify(Area=Area, UTM=utm_zone, Branch=brnch, Polygon=poly)
    return jsonify(Branch=brnch, Horton=Horton, Strahler=Strahler)


@app.route('/preprocess')
def preprocess():
    X = request.args.get('X', 0, type=float)
    Y = request.args.get('Y', 0, type=float)
    print(X, Y)
    whtroutine.points2shp(X, Y, out_url)
    boundary,X,Y,stat = whtroutine.snap(data_url, out_url, out_url2)
    return jsonify(Boundary=boundary,X=X,Y=Y,stat=stat)


@app.route('/download')
def download():
    return send_from_directory(directory='data', filename="rivers.zip")



if __name__ == '__main__':
    app.run(debug=True)
