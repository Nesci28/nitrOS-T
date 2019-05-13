import hashlib
from bson import ObjectId

from blockchain.db import connect_to_db_blockchain


def proof(timestamp, transactions, pof):
    block = str(timestamp).encode(
        'utf8') + str(transactions).encode('utf8') + str(pof['proof']).encode('utf8')
    hashed = hashlib.sha512(block).hexdigest()
    if hashed[0:pof['difficulty']] == pof['difficulty']*'0':
        return {"success": True, "proof": pof['proof'], "difficulty": pof['difficulty'], "hash": hashed}
    return {"success": False, "proof": pof['proof'], "difficulty": pof['difficulty'], "hash": hashed}


def calculate_difficulty(last_block, timestamp):
    if last_block['last_timestamp'] != "GENESIS":
        time_block = timestamp - last_block['last_timestamp']
        if time_block < 4 * 60 * 1000:
            return last_block['last_difficulty'] + 1
        elif time_block > 6 * 60 * 1000:
            if last_block['last_difficulty'] - 1 < 4:
                return 4
            else:
                return last_block['last_difficulty'] - 1
        return last_block['last_difficulty']
    else:
        return 4


def clear_open_transactions():
    db = connect_to_db_blockchain()
    db.find_one_and_update({
        "_id": ObjectId("5cc8e412fb6fc00ed59ea3bb")
    }, {
        '$set': {
            'open_transactions': []
        }
    })
    return
