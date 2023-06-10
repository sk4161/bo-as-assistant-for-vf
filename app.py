from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/data', methods=['POST'])
def receive_data():
    data = request.json # Get data sent from JavaScript

    index = data['index']
    value = data['value']

    # Print received data
    print(f'Slider Index: {index}, Value: {value}')

    response = {'message': 'Data received successfully'} # Send response to JavaScript
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=5000)
