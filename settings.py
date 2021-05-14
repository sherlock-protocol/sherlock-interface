import os
import json
import subprocess

from decouple import config
from web3 import Web3, HTTPProvider, WebsocketProvider

CONTRACTS = config('CONTRACTS')

SERVER_HOST = config('SERVER_HOST', default="localhost")
SERVER_PORT = config('SERVER_PORT', default=5000)

NETWORK = config('NETWORK')
CHAINID = config('CHAINID', cast=int)
INFURA_TOKEN = config('INFURA_TOKEN')

with open(os.path.join(CONTRACTS, "artifacts", "contracts", "interfaces", "ISherlock.sol", "ISherlock.json")) as json_data:
    POOL_ABI = json.load(json_data)["abi"]
    with open(os.path.join("static", "json", "abi", "Sherlock.json"), "w+") as static:
        static.write(json.dumps(POOL_ABI))


with open(os.path.join(CONTRACTS, "artifacts", "@openzeppelin", "contracts", "token", "ERC20", "ERC20.sol", "ERC20.json")) as json_data:
    ERC20_ABI = json.load(json_data)["abi"]

if NETWORK == 'KOVAN':
    INFURA_HTTP = Web3(HTTPProvider(
        "https://kovan.infura.io/v3/%s" % INFURA_TOKEN))
    INFURA_WSS = Web3(WebsocketProvider(
        "wss://kovan.infura.io/ws/v3/%s" % INFURA_TOKEN))
elif NETWORK == 'LOCALHOST':
    INFURA_HTTP = Web3(HTTPProvider("http://127.0.0.1:8545"))
    INFURA_WSS = Web3(WebsocketProvider("wss://127.0.0.1:8545"))
else:
    raise ValueError("Unknown network in .env")

if NETWORK == 'KOVAN':
    raise ValueError("Kovan not supported")
elif NETWORK == 'LOCALHOST':
    SHERLOCK = "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318"

SHERLOCK_HTTP = INFURA_HTTP.eth.contract(
    address=SHERLOCK, abi=POOL_ABI)

COINGECKO_IDS = {
    "ALCX": "alchemix",
    "WBTC": "wrapped-bitcoin",
    "USDC": "usd-coin",
    "BADGER": "badger-dao"
}

TOKENS = {}
for token in SHERLOCK_HTTP.functions.getTokens().call():
    w = INFURA_HTTP.eth.contract(address=token, abi=ERC20_ABI)
    token_decimals = w.functions.decimals().call()
    symbol = w.functions.symbol().call()
    TOKENS[symbol] = {
        "address": token,
        "name":  w.functions.name().call(),
        "decimals": token_decimals,
        "divider": float("1" + "0" * token_decimals),
        "coingecko": COINGECKO_IDS.get(symbol, symbol.lower())
    }

BLOCKS_PER_DAY = 6484
BLOCKS_PER_YEAR = BLOCKS_PER_DAY * 365

call = subprocess.run(['git', 'rev-parse', 'HEAD'], stdout=subprocess.PIPE)
GIT_HASH = call.stdout.strip().decode()
