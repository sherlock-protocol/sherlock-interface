import os
import json
import subprocess

from decouple import config
from web3 import Web3, HTTPProvider, WebsocketProvider
from web3.middleware import geth_poa_middleware

WORKER_ROOT = "indexer"

CONTRACTS = config('CONTRACTS')

SERVER_HOST = config('SERVER_HOST', default="localhost")
SERVER_PORT = config('SERVER_PORT', default=5000)

NETWORK = config('NETWORK')
CHAINID = config('CHAINID', cast=int)
INFURA_TOKEN = config('INFURA_TOKEN')
DOCS_BASEURL = config('DOCS_BASEURL')

with open(os.path.join(CONTRACTS, "artifacts", "@sherlock", "v1-core", "contracts", "interfaces", "ISherlock.sol", "ISherlock.json")) as json_data:
    POOL_ABI = json.load(json_data)["abi"]
    with open(os.path.join("static", "json", "abi", "Sherlock.json"), "w+") as static:
        static.write(json.dumps(POOL_ABI))


with open(os.path.join(CONTRACTS, "artifacts", "@openzeppelin", "contracts", "token", "ERC20", "ERC20.sol", "ERC20.json")) as json_data:
    ERC20_ABI = json.load(json_data)["abi"]

if NETWORK == 'GOERLI':
    INFURA_HTTP = Web3(HTTPProvider("https://eth-goerli.alchemyapi.io/v2/%s" % INFURA_TOKEN))
    INFURA_HTTP.middleware_onion.inject(geth_poa_middleware, layer=0)
    ENDPOINT = "https://eth-goerli.alchemyapi.io/v2/%s" % INFURA_TOKEN
elif NETWORK == 'LOCALHOST':
    INFURA_HTTP = Web3(HTTPProvider("http://127.0.0.1:8545"))
    ENDPOINT = "http://127.0.0.1:8545"
else:
    raise ValueError("Unknown network in .env")

if NETWORK == 'GOERLI':
    SHERLOCK = "0xE6f4e3af0d5d9BBC77d2e4b69c5F589d0Fc7b182"
elif NETWORK == 'LOCALHOST':
    SHERLOCK = "0x610178dA211FEF7D417bC0e6FeD39F05609AD788"

SHERLOCK_HTTP = INFURA_HTTP.eth.contract(address=SHERLOCK, abi=POOL_ABI)

COINGECKO_IDS = {
    "ALCX": "alchemix",
    "WBTC": "wrapped-bitcoin",
    "USDC": "usd-coin",
    "BADGER": "badger-dao"
}

try:
    path = os.path.join(WORKER_ROOT, "%s.json" % NETWORK)
    with open(path, "r") as f:
        DATA = json.load(f)
        TOKENS = DATA["token"]
except FileNotFoundError:
    print("!! CONFIG NOT FOUND")


BLOCKS_PER_DAY = 6484
BLOCKS_PER_YEAR = BLOCKS_PER_DAY * 365

try:
    with open(".hash", "r") as f:
        GIT_HASH = f.read().strip()
except FileNotFoundError:
    GIT_HASH = "call-make-app"

INDEXER_TIMEOUT = config('INDEXER_TIMEOUT', cast=int, default=60)


ETHERSCAN = config('ETHERSCAN', default="YourApiKeyToken")
FAUCET_KEY = config('FAUCET_KEY', default=None)
FAUCET_ADDRESS = config('FAUCET_ADDRESS', default=None)
FAUCET_TOKEN = config('FAUCET_TOKEN', default=None)
FAUCET_TOKEN_CONTRACT = INFURA_HTTP.eth.contract(address=FAUCET_TOKEN, abi=ERC20_ABI)