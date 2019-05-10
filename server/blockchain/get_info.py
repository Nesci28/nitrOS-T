from bson import ObjectId

from blockchain.hashing import password_compare, decode
from blockchain.db import connect_to_db_accounts, connect_to_db_blockchain


def get_balance(account_name):
    db = connect_to_db_accounts()
    account = db.find_one({"username": account_name})
    if account != '':
        return account['balance']
    else:
        return 'Wallet doesnt exist!'


def get_keys(account_name, account_password):
    db = connect_to_db_accounts()
    account = db.find_one({"username": account_name})
    if account != '':
        return {
            "public_key": account['publicKey'],
            "private_key": decode(account_password, account['privateKey'])
        }
    else:
        return 'Wallet doesnt exist!'


def get_transactions():
    db = connect_to_db_blockchain()
    open_transactions = db.find_one(
        {"_id": ObjectId("5cc8e412fb6fc00ed59ea3bb")})
    open_transactions = open_transactions['open_transactions']
    return open_transactions


# def get_my_tx(account_name, account_password):
#   keys = get_keys(account_name, account_password)
#   db = connect_to_db_blockchain()
#   my_tx = db.find({
#     'transactions.receiver': '$regex': 'markgagnon'
#   })
#   for el in my_tx:
#     print(el)
#   return my_tx


def get_nodes():
    db = connect_to_db_blockchain()
    nodes = db.find_one({"_id": ObjectId("5cc9c967e7179a596b194ca1")})
    nodes = nodes['nodes']
    return nodes


def get_blockchain():
    db = connect_to_db_blockchain()
    blockchain = db.find_one({"_id": ObjectId("5cc8ec4efb6fc00ed59ea5fd")})
    return blockchain


def get_last_block():
    db = connect_to_db_blockchain()
    last_block = db.find_one({"_id": ObjectId("5cc8ec4efb6fc00ed59ea5fd")}, {
                             "block": {'$slice': -1}})
    return last_block['block'][0]


# get_my_tx('markgagnon', 'root')
