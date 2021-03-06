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

with open(os.path.join(CONTRACTS, "artifacts", "@sherlock", "v1-core", "contracts", "interfaces", "aaveV2", "ILendingPool.sol", "ILendingPool.json")) as json_data:
    LP_ABI = json.load(json_data)["abi"]

with open(os.path.join(CONTRACTS, "artifacts", "@sherlock", "v1-core", "contracts", "interfaces", "IStrategy.sol", "IStrategy.json")) as json_data:
    STATEGY_ABI = json.load(json_data)["abi"]

if NETWORK == 'KOVAN':
    INFURA_HTTP = Web3(HTTPProvider("https://eth-kovan.alchemyapi.io/v2/%s" % INFURA_TOKEN))
    INFURA_HTTP.middleware_onion.inject(geth_poa_middleware, layer=0)
    ENDPOINT = "https://eth-kovan.alchemyapi.io/v2/%s" % INFURA_TOKEN
    AAVE_LP = "0xE0fBa4Fc209b4948668006B2bE61711b7f465bAe"
elif NETWORK == 'LOCALHOST':
    INFURA_HTTP = Web3(HTTPProvider("http://127.0.0.1:8545"))
    ENDPOINT = "http://127.0.0.1:8545"
    AAVE_LP = "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9"
elif NETWORK == 'MAINNET':
    INFURA_HTTP = Web3(HTTPProvider("https://eth-mainnet.alchemyapi.io/v2/%s" % INFURA_TOKEN))
    ENDPOINT = "https://eth-mainnet.alchemyapi.io/v2/%s" % INFURA_TOKEN
    AAVE_LP = "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9"
else:
    raise ValueError("Unknown network in .env")

if NETWORK == 'KOVAN':
    SHERLOCK = "0xAc8075751E250dBC5F09e639E75FeCa7656eeD3c"
elif NETWORK == 'LOCALHOST':
    SHERLOCK = "0x04C89607413713Ec9775E14b954286519d836FEf"
elif NETWORK == 'MAINNET':
    SHERLOCK = "0xacbBe1d537BDa855797776F969612df7bBb98215"

SHERLOCK_HTTP = INFURA_HTTP.eth.contract(address=SHERLOCK, abi=POOL_ABI)

if AAVE_LP:
    AAVE_LP_HTTP = INFURA_HTTP.eth.contract(address=AAVE_LP, abi=LP_ABI)

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

TG_BOT = config('TG_BOT')
TG_RECEIVER = config('TG_RECEIVER')

TIMESTAMP_ERROR = 0
if os.environ.get("FLASK_ENV") == 'development':
    TIMESTAMP_ERROR = -67
