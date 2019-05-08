from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_basicauth import BasicAuth
import pymongo
import os
import bcrypt
import base64

# Load dotenv file
from dotenv import load_dotenv
from pathlib import Path
env_path = Path('.') / '.env'
load_dotenv(dotenv_path=env_path)

# Creating the server app
app = Flask(__name__)
CORS(app)
basic_auth = BasicAuth(app)


@app.route('/login', methods=['POST'])
def login():
    db = connect_to_db_accounts()
    body = request.get_json()
    print(body)
    account = db.find_one({"username": body['username']})
    if account is not None:
        if password_compare(body['password'], account['password']):
            if 'privateKey' not in account or 'publicKey' not in account:
                message = {
                    "message": "no public and/or private key detected",
                    "code": 401
                }
            else:
                public_key = account['publicKey']
                private_key = decode(body['password'], account['privateKey'])
                balance = account['balance']
                message = {
                    "message": {
                        "public_key": public_key,
                        "private_key": private_key,
                        "balance": balance
                    },
                    "code": 200
                }
        else:
            message = {
                "message": "Wrong password!",
                "code": 401
            }
    else:
        message = {
            "message": "Account not found",
            "code": 201
        }
    if type(message) is dict:
        app.config['BASIC_AUTH_USERNAME'] = os.getenv("BASIC_AUTH_USERNAME")
        app.config['BASIC_AUTH_PASSWORD'] = os.getenv("BASIC_AUTH_PASSWORD")
        return jsonify(message['message']), message['code']
    else:
        return message["message"], message['code']


@app.route('/message', methods=['GET'])
@basic_auth.required
def message():
    return 'tets'


# Helpers
def connect_to_db_accounts():
    DB_USERNAME = os.getenv("DB_USERNAME")
    DB_PASSWORD = os.getenv("DB_PASSWORD")
    DB_URL = os.getenv("DB_URL")
    db = pymongo.MongoClient(
        "mongodb://{}:{}@{}".format(DB_USERNAME, DB_PASSWORD, DB_URL))
    db = db['webserver']
    db = db["blockchain_accounts"]
    return db


def password_compare(account_password, db_password):
    """Compare plain pass. to encrypted pass. (2 args)\n
      plain password, encrypted password
    """
    if bcrypt.checkpw(account_password.encode(), db_password.encode()):
        return True
    else:
        return False


def decode(key, enc):
    dec = []
    enc = base64.urlsafe_b64decode(enc).decode()
    for i in range(len(enc)):
        key_c = key[i % len(key)]
        dec_c = chr((256 + ord(enc[i]) - ord(key_c)) % 256)
        dec.append(dec_c)
    return "".join(dec)
