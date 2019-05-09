from bson import ObjectId
import json
import time

from blockchain.get_info import get_balance, get_keys
from blockchain.db import connect_to_db_blockchain, connect_to_db_accounts
from blockchain.hashing import password_compare
import blockchain.wallet as wallet


class Tx:
    wallet = wallet.Wallet()

    def add_transaction(self, sender, receiver, amount):
        if sender != "MINING":
            account_password = sender[1]
            sender = sender[0]
            db = connect_to_db_accounts()
            db_password = db.find_one({"username": sender})
            db_password = db_password['password']
            if password_compare(account_password, db_password):
                balance = get_balance(sender)
                liquidity = balance >= amount
                if liquidity:
                    self.remove_liquidity(sender, balance, amount)
                    keys = get_keys(sender, account_password)
                    signature = self.wallet.sign_transaction(
                        keys['public_key'], keys['private_key'], receiver, amount)
                    transaction = {
                        "sender": keys['public_key'],
                        "receiver": receiver,
                        "signature": signature,
                        "amount": amount
                    }
                    if self.wallet.verify_transaction(transaction):
                        self.insert_transaction(transaction, None)
                        if self.confirm_transaction(db, transaction):
                            message = {
                                "message": 'Transaction {} confirmed'.format(transaction),
                                "code": 201
                            }
                        else:
                            message = {
                                "message": 'Transaction failed',
                                "code": 400
                            }
                    else:
                        message = {
                            "message": 'Bad transaction signature',
                            "code": 400
                        }
                else:
                    message = {
                        "message": 'Not enough credit',
                        "code": 400
                    }
            else:
                message = {
                    "message": 'Wrong password',
                    "code": 400
                }
            return message

    def confirm_transaction(self, db, transaction):
        db = connect_to_db_blockchain()
        find_tx = db.find_one(
            {
                "_id": ObjectId("5cc8e412fb6fc00ed59ea3bb"),
                "open_transactions": transaction
            }
        )
        if find_tx != None:
            return True
        else:
            return False

    def add_mining_transactions(self, mining_transactions):
        db = connect_to_db_blockchain()
        for el in mining_transactions:
            self.insert_transaction(el, db)

    def remove_liquidity(self, sender, balance, amount):
        db = connect_to_db_accounts()
        new_balance = balance - amount
        db.update_one({
            "username": sender
        }, {
            '$set': {
                "balance": new_balance
            }
        })

    def insert_transaction(self, transaction, db):
        if db == None:
            db = connect_to_db_blockchain()
        db.find_one_and_update({
            "_id": ObjectId("5cc8e412fb6fc00ed59ea3bb")
        }, {
            '$push': {
                'open_transactions': transaction
            }
        })
        print('transaction added')

    def remove_transaction(self, transaction):
        db = connect_to_db_blockchain()
        db.find_one_and_update({
            "_id": ObjectId("5cc8ec4efb6fc00ed59ea5fd")
        }, {
            '$pull': {
                'block': {
                    'transactions': transaction
                }
            }
        })
        print('Transaction: {} removed'.format(transaction))

    # @staticmethod
    # def show_transactions(account_name, account_password):
    #   my_tx = get_my_tx(account_name, account_password)
    #   return {
    #     "message": str(my_tx).replace("'", '"'),
    #     "code": 200
    #   }

# tx = Tx()
# tx.add_transaction(['markgagnon', 'root'], 'Marie', 4)

# Tx().show_transactions('markgagnon', 'root')
