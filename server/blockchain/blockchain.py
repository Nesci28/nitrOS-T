from bson import ObjectId
import time

from blockchain.db import connect_to_db_blockchain, connect_to_db_accounts
from blockchain.get_info import get_blockchain


class Blockchain:
    def __init__(self):
        self.db = connect_to_db_blockchain()
        self.blockchain = self.db.find_one(
            {"_id": ObjectId("5cc8ec4efb6fc00ed59ea5fd")})
        if len(self.blockchain['block']) == 0:
            self.add_block(self.genesis_block())

    def __repr__(self):
        return 'Number of blocks: ' + str(len(self.blockchain['block']))

    def add_block(self, block):
        self.db.find_one_and_update({
            "_id": ObjectId("5cc8ec4efb6fc00ed59ea5fd")
        }, {
            '$push': {
                'block': block
            }
        })
        if block['hash'] == "GENESIS":
            print('Genesis block added to the blockchain')
        else:
            print('Block : "{}" added to the blockchain\nHash: "{}"'.format(
                block['index'], block['hash']))

    def genesis_block(self):
        block = {
            "index": 0,
            "timestamp": int(round(time.time() * 1000)),
            "transactions": [],
            "difficulty": 4,
            "hash": "GENESIS",
            "proof": 100,
            "last_timestamp": "GENESIS",
            "last_difficulty": "GENESIS",
            "previous_hash": "GENESIS"
        }
        return block

    @staticmethod
    def show_blockchain():
        blockchain = get_blockchain()
        return {
            "message": str(blockchain).replace("'", '"').replace('ObjectId(', '').replace(')', ''),
            "code": 200
        }

    def hack_blockchain(self):
        self.db.find_one_and_update({
            "_id": ObjectId("5cc8ec4efb6fc00ed59ea5fd")
        }, {
            '$set': {
                'block': []
            }
        })
        print('Blockchain deleted')

    def hack_transactions(self):
        self.db.find_one_and_update({
            "_id": ObjectId("5cc8e412fb6fc00ed59ea3bb")
        }, {
            '$set': {
                'open_transactions': []
            }
        })
        print('Open transactions deleted')


# if __name__ == "__main__":
    #   Blockchain().hack_transactions()
    #   Blockchain().hack_blockchain()
    # print('test')
    # Blockchain()
