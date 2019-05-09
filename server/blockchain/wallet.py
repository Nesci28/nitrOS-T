from blockchain.hashing import password_compare, password_hash, encode, decode, create_keys, tx_signature, ver_signature
from blockchain.get_info import get_balance, get_keys
from blockchain.db import connect_to_db_accounts


class Wallet():
    def load_wallet(self, account_name, account_password):
        db = connect_to_db_accounts()
        account = db.find_one({"username": account_name})
        if account is not None:
            if password_compare(account_password, account['password']):
                if 'privateKey' not in account or 'publicKey' not in account:
                    message = {
                        "message": "no public and/or private key detected",
                        "code": 401
                    }
                else:
                    public_key = account['publicKey']
                    private_key = decode(
                        account_password, account['privateKey'])
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
        return message

    def create_wallet(self, account_email, account_name, account_password):
        keys = create_keys(account_password)
        public_key = keys['public_key']
        private_key = keys['private_key']
        password = password_hash(account_password)
        message = {
            "email": account_email,
            "username": account_name,
            "password": password,
            "publicKey": public_key,
            "privateKey": private_key
        }
        return message

    @staticmethod
    def sign_transaction(public_key, private_key, receiver, amount):
        signature = tx_signature(public_key, private_key, receiver, amount)
        return signature

    @staticmethod
    def verify_transaction(transaction):
        verify_signature = ver_signature(transaction)
        return verify_signature


# wallet = Wallet()
# wallet.load_wallet('markgagnon', 'root')
# print(get_balance('markgagnon'))
