from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/data', methods=['POST'])
def receive_data():
    data_package = request.json # Get data sent from JavaScript

    preferred_data = data_package['preferredData']
    print(f'Preferred Data - Slider Index: {preferred_data["index"]}, Value: {preferred_data["value"]}')

    other_data_list = data_package['otherData']
    print(f'Other Data: {other_data_list}')

    response = {'message': 'Data received successfully'} # Send response to JavaScript
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=5000)
