from flask import Flask, render_template, url_for, request, session, redirect, jsonify
from flask_pymongo import PyMongo
from flask_cors import CORS, cross_origin
from flask_socketio import SocketIO, send, emit
from functools import wraps
import bcrypt
import binascii
import os
from bson import json_util, ObjectId
import json
import time

from blockchain.hashing import decode
from blockchain.wallet import Wallet
from blockchain.transactions import Tx
from blockchain.block import Block
from blockchain.blockchain import Blockchain


# Load dotenv file
from dotenv import load_dotenv
from pathlib import Path
env_path = Path('.') / '.env'
load_dotenv(dotenv_path=env_path)

# Start the flask App
app = Flask(__name__)
app.secret_key = os.getenv("APP_SECRET")
socketio = SocketIO(app)
CORS(app, support_credentials=True)

# Setup the DB
app.config['MONGODBNAME'] = os.getenv("DB_HOST")
app.config['MONGO_URI'] = os.getenv("DB_URL")
mongo = PyMongo(app)

# Setup the currently logged In user set (for socketIO)
connected_nodes = []


# SocketIO
@socketio.on('connect')
def node_connect(methods=['GET']):
    global connected_nodes
    if session['username'] not in connected_nodes:
        connected_nodes.append(session['username'])
    emit('response', {
        'message': 'connected',
        'node': session['username'],
        'conncted_nodes': connected_nodes
    })
    print('Client connected')


@socketio.on('disconnect')
def node_disconnect(methods=["GET"]):
    global connected_nodes
    if session['username'] in connected_nodes:
        connected_nodes.remove(session['username'])
    print('Client disconnected')


# Routes protection decorator
def login_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if not session.get('username'):
            return "Please login first"
        return fn(*args, **kwargs)
    return wrapper


def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        print(session.get('username'))
        if session.get('username') != 'nesci':
            return "Not admin"
        return fn(*args, **kwargs)
    return wrapper


# Routes
@app.route('/login', methods=["POST"])
@cross_origin(supports_credentials=True)
def login_post():
    if 'username' in session.keys():
        return 'Already logged in'
    body = request.get_json()
    users = mongo.db.blockchain_accounts
    user = users.find_one({'username': body['username']})
    if user:
        if bcrypt.hashpw(body['password'].encode('utf-8'), user['password'].encode('utf-8')) == user['password'].encode('utf-8'):
            session.permanent = False
            session['username'] = body['username']
            return jsonify({"message": 'logged in'})
    return jsonify({"message": 'invalid credentials'})


@app.route('/login', methods=["GET"])
@cross_origin(supports_credentials=True)
def login_get():
    if 'username' in session.keys():
        return jsonify({"message": 'Already logged in'})
    return jsonify({"message": 'not logged in'})


@app.route('/register', methods=["POST"])
@cross_origin(supports_credentials=True)
def signup():
    body = request.get_json()
    account = Wallet().create_wallet(
        body['email'], body['username'], body['password'])
    users = mongo.db.blockchain_accounts
    user = users.find_one({'username': account['username']})
    if user is None:
        users.insert_one({'username': account['username'], 'password': account['password'],
                          'publicKey': account['publicKey'], 'privateKey': account['privateKey'], 'balance': 1000})
    return jsonify({"message": 'Account created'})


@app.route('/get-balance', methods=["GET"])
@cross_origin(supports_credentials=True)
@login_required
def get_balance():
    users = mongo.db.blockchain_accounts
    user = users.find_one({'username': session['username']})
    if user:
        balance = user['balance']
        return str(balance)


@app.route('/get-username', methods=["GET"])
@cross_origin(supports_credentials=True)
@login_required
def get_username():
    return jsonify({"message": session['username']})


@app.route('/get-wallet', methods=['GET'])
@cross_origin(supports_credentials=True)
@login_required
def get_wallet():
    users = mongo.db.blockchain_accounts
    user = users.find_one({'username': session['username']})
    if user:
        user.pop('_id')
        user.pop('password')
        return jsonify(user)


@app.route('/decode', methods=['POST'])
@cross_origin(supports_credentials=True)
@login_required
def decodePK():
    body = request.get_json()
    users = mongo.db.blockchain_accounts
    user = users.find_one({'username': session['username']})
    if user:
        if bcrypt.hashpw(body['password'].encode('utf-8'), user['password'].encode('utf-8')) == user['password'].encode('utf-8'):
            private_key = decode(body['password'], user['privateKey'])
            return jsonify({"message": private_key})
        return jsonify({"message": "invalid credentials"})


@app.route('/message/<id>', methods=['GET'])
@cross_origin(supports_credentials=True)
@login_required
def get_message(id):
    message = mongo.db.message
    posts = []
    for el in message.find().limit(20*int(id)):
        el.pop('_id')
        posts.append(el)
    posts = {
        "posts": posts
    }
    return jsonify(posts)


@app.route('/message', methods=['POST'])
@cross_origin(supports_credentials=True)
@login_required
def post_message():
    cost = 0
    body = request.get_json()
    body['username'] = session.get('username')
    if body['message'] != '':
        cost += 10
    if body['image'] != '':
        cost += 10
    if body['video'] != '':
        cost += 20
    if body['whiteboard'] != '':
        cost += 15
    users = mongo.db.blockchain_accounts
    user = users.find_one({'username': session['username']})
    balance = user['balance']
    if balance >= cost:
        new_balance = balance - cost
        users.update_one({
            "username": session['username']
        }, {
            '$set': {
                "balance": new_balance
            }
        })
        message = mongo.db.message
        message.insert_one(body)
        return jsonify({"message": 'post added'})
    else:
        return jsonify({"message": 'insufficient funds'})


@app.route('/get-message/<id>', methods=['GET'])
@cross_origin(supports_credentials=True)
@login_required
def get_message_id(id):
    message = mongo.db.message
    posts = []
    for el in message.find():
        post_id = el.pop('_id')
        posts.append(el)
    posts = {
        "posts": posts[int(id)]
    }
    return jsonify({"post": posts, "id": str(post_id)})


@app.route('/reply', methods=['POST'])
@cross_origin(supports_credentials=True)
@login_required
def reply():
    cost = 10
    body = request.get_json()
    users = mongo.db.blockchain_accounts
    user = users.find_one({'username': session['username']})
    balance = user['balance']
    if balance >= cost:
        new_balance = balance - cost
        users.update_one({
            "username": session['username']
        }, {
            '$set': {
                "balance": new_balance
            }
        })
        message = mongo.db.message
        message.find_one_and_update({
            "_id": ObjectId(body['id'])
        }, {
            '$push': {
                'replies': {
                    "username": session['username'],
                    "message": body['reply']
                }
            }
        })
        return jsonify({"message": "reply posted successfully"})
    return jsonify({"message": "insufficient funds"})


@app.route("/add-tx", methods=['POST'])
@cross_origin(supports_credentials=True)
@login_required
def add_tx():
    body = request.get_json()
    users = mongo.db.blockchain_accounts
    user = users.find_one({'username': body['sender']})
    if user:
        if bcrypt.hashpw(body['password'].encode('utf-8'), user['password'].encode('utf-8')) == user['password'].encode('utf-8'):
            Tx().add_transaction(body['sender'], body['password'],
                                 body['receiver'], body['amount'])
            return jsonify({"message": "Transaction added"})
        return jsonify({"message": "Invalid credentials"})
    return jsonify({"message": "Wallet does not exist"})


@app.route("/explorer", methods=['GET'])
@cross_origin(supports_credentials=True)
def explorer():
    blockchain = mongo.db.blockchain
    blocks = json_util.dumps(blockchain.find(
        {"_id": ObjectId("5cc8ec4efb6fc00ed59ea5fd")}))
    blocks = json_util.loads(blocks)
    return jsonify(blocks[0]['block'])


@app.route("/mine", methods=['GET'])
@cross_origin(supports_credentials=True)
@login_required
@socketio.on('mine')
def mine():
    global connected_nodes
    print('mining')
    block = Block().mine(session['username'], connected_nodes)
    block = block.replace("'", '"')
    block = json.loads(block)
    emit('found_block', {"message": "Found a block", "block": block})
    # return jsonify({"message": "Block founded", "block": block})


@app.route("/clear", methods=['GET'])
@cross_origin(supports_credentials=True)
@admin_required
def clear_blockchain():
    Blockchain().hack_transactions()
    Blockchain().hack_blockchain()
    Blockchain()
    return "Deleted the current blockchain and created a Genesis block"


# Automatically run the auto reload server by only running the script
if __name__ == '__main__':
    # app.secret_key = 'mysecret'
    # socketio.run(app, debug=True)
    app.run(debug=True)
