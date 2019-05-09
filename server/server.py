from flask import Flask, render_template, url_for, request, session, redirect, jsonify
from flask_pymongo import PyMongo
from flask_cors import CORS, cross_origin
from functools import wraps
import bcrypt
import binascii
import os
from bson import json_util, ObjectId
import json

from blockchain.hashing import decode
from blockchain.wallet import Wallet


# Load dotenv file
from dotenv import load_dotenv
from pathlib import Path
env_path = Path('.') / '.env'
load_dotenv(dotenv_path=env_path)

# Start the flask App
app = Flask(__name__)
app.secret_key = os.getenv("APP_SECRET")
CORS(app, support_credentials=True)

# Setup the DB
app.config['MONGODBNAME'] = os.getenv("DB_HOST")
app.config['MONGO_URI'] = os.getenv("DB_URL")
mongo = PyMongo(app)


# Routes protection decorator
def login_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if not session.get('username'):
            return "Please login first"
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
            print(private_key)
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


# Automatically run the auto reload server by only running the script
if __name__ == '__main__':
    app.secret_key = 'mysecret'
    app.run(debug=True)
