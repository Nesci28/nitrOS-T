import time
import json
import random

import blockchain.transactions as transactions
import blockchain.blockchain as blockchain
from blockchain.wallet import Wallet
from blockchain.mining import proof, calculate_difficulty, clear_open_transactions
from blockchain.get_info import get_balance, get_transactions, get_last_block
from blockchain.db import connect_to_db_accounts

MINING_REWARD = 100


class Block():
    tx = transactions.Tx()
    blk = blockchain.Blockchain()

    def mine(self, current_wallet, nodes):
        last_block = get_last_block()
        index = last_block['index'] + 1
        timestamp = int(round(time.time() * 1000))
        transactions = get_transactions()
        difficulty = calculate_difficulty(last_block, timestamp)
        proof = self.proof_of_work(
            timestamp, transactions, difficulty, current_wallet)
        block = {
            "index": index,
            "timestamp": timestamp,
            "transactions": transactions,
            "difficulty": difficulty,
            "hash": proof['hash'],
            "proof_of_work": proof['pof'],
            "last_timestamp": last_block['timestamp'],
            "last_difficulty": last_block['difficulty'],
            "previous_hash": last_block['hash']
        }
        self.blk.add_block(block)
        self.transfer_funds(transactions)
        mining_transactions = [
            {"sender": "MINING", "receiver": current_wallet, "amount": MINING_REWARD / 2}]
        individual_reward = (MINING_REWARD / 2) / len(nodes)
        for el in nodes:
            mining_transactions.append(
                {"sender": "MINING", "receiver": el, "amount": individual_reward})
        clear_open_transactions()
        self.tx.add_mining_transactions(mining_transactions)
        return str(block)

    def proof_of_work(self, timestamp, transactions, difficulty, current_wallet):
        pof = {"success": False, "proof": -1, "difficulty": difficulty}
        while pof['success'] == False:
            pof['proof'] = random.randint(1, 2**31)
            pof = proof(timestamp, transactions, pof)
        return {
            "hash": pof['hash'],
            "pof": pof['proof']
        }

    def transfer_funds(self, transactions):
        if len(transactions) > 0:
            db = connect_to_db_accounts()
            for el in transactions:
                if Wallet.verify_transaction(el):
                    db.find_one_and_update({
                        "username": el['receiver']
                    }, {
                        '$inc': {
                            "balance": el['amount']
                        }
                    })
                    print('{} received {}'.format(
                        el['receiver'], el['amount']))
                else:
                    print('Transaction {} is invalid'.format(el))
                    self.tx.remove_transaction(el)


# print(Block().tx.add_transaction('MINING', 'markgagnon', 100))
# Block().mine('markgagnon', '')
# print(get_transactions())
# clear_open_transactions()
# print(get_last_block())
