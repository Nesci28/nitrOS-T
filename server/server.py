from flask import Flask, render_template, url_for, request, session, redirect, jsonify
from flask_pymongo import PyMongo
from flask_cors import CORS
from functools import wraps
import bcrypt
import binascii
import os
from bson import json_util, ObjectId
import json

# Load dotenv file
from dotenv import load_dotenv
from pathlib import Path
env_path = Path('.') / '.env'
load_dotenv(dotenv_path=env_path)

# Start the flask App
app = Flask(__name__)
app.secret_key = os.getenv("APP_SECRET")
CORS(app)

# Setup the DB
app.config['MONGODBNAME'] = os.getenv("DB_HOST")
app.config['MONGO_URI'] = os.getenv("DB_URL")
mongo = PyMongo(app)


# Routes protection decorator
def login_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if not session.get('username'):
            return "Please log in first"
        return fn(*args, **kwargs)
    return wrapper


# Routes
@app.route('/login', methods=["POST"])
def login():
    if 'username' in session.keys():
        return 'Already logged in'
    body = request.get_json()
    users = mongo.db.blockchain_accounts
    user = users.find_one({'username': body['username']})
    if user:
        if bcrypt.hashpw(body['password'].encode('utf-8'), user['password'].encode('utf-8')) == user['password'].encode('utf-8'):
            session.permanent = False
            session['username'] = body['username']
            return 'logged in'
    return 'invalid credentials'


@app.route('/register', methods=["POST"])
def register():
    body = request.get_json()
    if body['username'] and body['password']:
        users = mongo.db.blockchain_accounts
        user = users.find_one({'username': body['username']})
        if user is None:
            hashpass = bytes(body['password'], encoding="ascii")
            hashpass = bcrypt.hashpw(hashpass, bcrypt.gensalt())
            hashpass = hashpass.decode('ascii')
            users.insert_one(
                {'username': body['username'], 'password': hashpass, 'balance': 1000})
            session['username'] = body['username']
            return 'Accound created'
        return 'Username already used'


@app.route('/get-balance', methods=["GET"])
@login_required
def get_balance():
    users = mongo.db.blockchain_accounts
    user = users.find_one({'username': session['username']})
    if user:
        balance = user['balance']
        return str(balance)


@app.route('/message/<id>', methods=['GET'])
@login_required
def get_message(id):
    message = mongo.db.message
    posts = []
    for el in message.find().limit(20*int(id)):
        el.pop('_id')
        posts.append(el)
    return jsonify(posts)


@app.route('/message', methods=['POST'])
@login_required
def post_message():
    cost = 0
    body = request.get_json()
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
        return 'post added'


# Automatically run the auto reload server by only running the script
if __name__ == '__main__':
    app.secret_key = 'mysecret'
    app.run(debug=True)
