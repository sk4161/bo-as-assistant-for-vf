import numpy as np
from flask import Flask, jsonify, render_template, request

from bayesian_optimization import BayesianOptimizer

app = Flask(__name__)
BayesianOptimizer = BayesianOptimizer()


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/data", methods=["POST"])
def receive_data():
    data_package = request.json  # Get data sent from JavaScript

    # Convert preferred option to numpy array (float64)
    preferred_option = np.array(data_package["preferredData"], dtype=np.float64)
    print(f"Preferred Option: {preferred_option}")

    # Convert other options to a numpy array (float64)
    other_options = [
        np.array(data, dtype=np.float64) for data in data_package["otherData"]
    ]
    print(f"Other Options: {other_options}")

    # Get suggestions from Bayesian optimizer
    suggestions = BayesianOptimizer.suggest_params(preferred_option, other_options)

    print(f"Suggestions: {suggestions}")

    suggestions = suggestions.tolist()  # Convert suggestions to list (float64 -> float)

    response = {"suggestions": suggestions}  # Send suggestions back to JavaScript
    return jsonify(response)


if __name__ == "__main__":
    app.run(debug=True, host="localhost", port=5000)
