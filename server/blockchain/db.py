import pymongo
import os

# Load dotenv file
from dotenv import load_dotenv
from pathlib import Path
env_path = Path('.') / '.env'
load_dotenv(dotenv_path=env_path)


def connect_to_db_accounts():
  DB_USERNAME = os.getenv("DB_USERNAME")
  DB_PASSWORD = os.getenv("DB_PASSWORD")
  DB_URL = os.getenv("DB_URL")
  db = pymongo.MongoClient("mongodb://{}:{}@{}".format(DB_USERNAME, DB_PASSWORD, DB_URL))
  db = db['webserver']
  db = db["blockchain_accounts"]
  return db


def connect_to_db_blockchain():
  DB_USERNAME = os.getenv("DB_USERNAME")
  DB_PASSWORD = os.getenv("DB_PASSWORD")
  DB_URL = os.getenv("DB_URL")
  db = pymongo.MongoClient("mongodb://{}:{}@{}".format(DB_USERNAME, DB_PASSWORD, DB_URL))
  db = db['webserver']
  db = db["blockchain"]
  return db