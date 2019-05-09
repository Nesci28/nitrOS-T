from flask import Flask, jsonify, request
from flask_cors import CORS

from wallet import Wallet
from transactions import Tx
from blockchain import Blockchain
from block import Block
from nodes import Nodes

app = Flask(__name__)
CORS(app)


@app.route('/signup', methods=["POST"])
def signup():
    body = request.get_json()
    res = Wallet().create_wallet('', body['username'], body['password'])
    return res['message'], res['code']


@app.route("/login", methods=['POST'])
def login():
    body = request.get_json()
    res = Wallet().load_wallet(body['username'], body['password'])
    if type(res) is dict:
        return jsonify(res['message']), res['code']
    else:
        return res["message"], res['code']


@app.route("/logout", methods=['POST'])
def logout():
    body = request.get_json()
    res = Nodes().remove_node(body['username'], body['password'])
    if type(res) is dict:
        return jsonify(res['message']), res['code']
    else:
        return res["message"], res['code']


@app.route("/add-tx", methods=['POST'])
def add_tx():
    body = request.get_json()
    res = Tx().add_transaction(body['sender'],
                               body['receiver'], body['amount'])
    return res['message'], res['code']


# @app.route("/my-tx", methods=['POST'])
# def my_tx():
#   body = request.get_json()
#   res =


@app.route("/blockchain", methods=["GET"])
def get_blockchain():
    res = Blockchain().show_blockchain()
    return res['message'], res['code']


@app.route("/mine", methods=["POST"])
def mine():
    body = request.get_json()
    Block().mine(body['username'])
    # return res['message'], res['code']
