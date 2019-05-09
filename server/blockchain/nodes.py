from bson import ObjectId

from blockchain.db import connect_to_db_blockchain, connect_to_db_accounts
from blockchain.get_info import get_nodes
from blockchain.hashing import password_compare


class Nodes:
    def __init__(self):
        self.nodes = get_nodes()
        print('Current list of miners {}'.format(self.nodes))

    def add_node(self, node):
        db = connect_to_db_blockchain()
        db.find_one_and_update({
            "_id": ObjectId("5cc9c967e7179a596b194ca1")
        }, {
            '$addToSet': {
                'nodes': node
            }
        })
        print('Node {} added'.format(node))

    def remove_node(self, node, node_password):
        db = connect_to_db_accounts()
        account = db.find_one({"username": node})
        if account != '':
            db_password = account['password']
            if password_compare(node_password, db_password):
                db = connect_to_db_blockchain()
                db.find_one_and_update({
                    "_id": ObjectId("5cc9c967e7179a596b194ca1")
                }, {
                    '$pull': {
                        'nodes': node
                    }
                })
                message = {
                    "message": 'Node {} removed'.format(node),
                    "code": 201
                }
            else:
                message = {
                    "message": 'Wrong password',
                    "code": 401
                }
        return message

# Nodes().remove_node('markgagnon', 'root')
