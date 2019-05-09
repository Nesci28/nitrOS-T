from Crypto.PublicKey import RSA
from Crypto.Signature import PKCS1_v1_5
from Crypto.Hash import SHA256
import Crypto.Random
import binascii
import bcrypt
import base64
import time


def password_compare(account_password, db_password):
    """Compare plain pass. to encrypted pass. (2 args)\n
      plain password, encrypted password
    """
    if bcrypt.checkpw(account_password.encode(), db_password.encode()):
        return True
    else:
        return False


def password_hash(account_password):
    password = bytes(account_password, encoding="ascii")
    password_hashed = bcrypt.hashpw(password, bcrypt.gensalt())
    password_hashed = password_hashed.decode('ascii')
    return password_hashed


def encode(key, clear):
    enc = []
    for i in range(len(clear)):
        key_c = key[i % len(key)]
        enc_c = chr((ord(clear[i]) + ord(key_c)) % 256)
        enc.append(enc_c)
    return base64.urlsafe_b64encode("".join(enc).encode()).decode()


def decode(key, enc):
    dec = []
    enc = base64.urlsafe_b64decode(enc).decode()
    for i in range(len(enc)):
        key_c = key[i % len(key)]
        dec_c = chr((256 + ord(enc[i]) - ord(key_c)) % 256)
        dec.append(dec_c)
    return "".join(dec)


def create_keys(account_password):
    private_key = RSA.generate(1024, Crypto.Random.new().read)
    public_key = private_key.publickey()
    private_key = binascii.hexlify(
        private_key.exportKey(format='DER')).decode('ascii')
    public_key = binascii.hexlify(
        public_key.exportKey(format='DER')).decode('ascii')
    private_key = encode(account_password, private_key)
    return {"public_key": public_key, "private_key": private_key}


def tx_signature(sender, private_key, receiver, amount):
    signer = PKCS1_v1_5.new(RSA.importKey(binascii.unhexlify(private_key)))
    h = SHA256.new((str(sender) + str(receiver) + str(amount)).encode('utf8'))
    signature = signer.sign(h)
    return binascii.hexlify(signature).decode('ascii')


def ver_signature(transaction):
    if transaction['sender'] == "MINING":
        return True
    sender = transaction['sender']
    receiver = transaction['receiver']
    signature = transaction['signature']
    amount = transaction['amount']
    public_key = RSA.importKey(binascii.unhexlify(sender))
    verifier = PKCS1_v1_5.new(public_key)
    h = SHA256.new((str(sender) + str(receiver) + str(amount)).encode('utf8'))
    return verifier.verify(h, binascii.unhexlify(signature))
