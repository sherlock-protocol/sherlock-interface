from web3 import Web3, HTTPProvider, WebsocketProvider
from decouple import config
import os
import json

CONTRACTS = config('CONTRACTS')

SERVER_HOST = config('SERVER_HOST', default="localhost")
SERVER_PORT = config('SERVER_PORT', default=5000)

NETWORK = config('NETWORK')
CHAINID = config('CHAINID', cast=int)
INFURA_TOKEN = config('INFURA_TOKEN')

with open(os.path.join(CONTRACTS, "artifacts", "contracts", "interfaces", "ISolution.sol", "ISolution.json")) as json_data:
    POOL_ABI = json.load(json_data)["abi"]

if NETWORK == 'KOVAN':
    INFURA_HTTP = Web3(HTTPProvider("https://kovan.infura.io/v3/%s" % INFURA_TOKEN))
    INFURA_WSS = Web3(WebsocketProvider("wss://kovan.infura.io/ws/v3/%s" % INFURA_TOKEN))
elif NETWORK == 'LOCALHOST':
    INFURA_HTTP = Web3(HTTPProvider("http://127.0.0.1:8545"))
    INFURA_WSS = Web3(WebsocketProvider("wss://127.0.0.1:8545"))
else:
    raise ValueError("Unknown network in .env")

if NETWORK == 'KOVAN':
    raise ValueError("Kovan not supported")
elif NETWORK == 'LOCALHOST':
    POOL_ADDRESS = "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6"

POOL_CONTRACT_HTTP = INFURA_HTTP.eth.contract(address=POOL_ADDRESS, abi=POOL_ABI)

PROTOCOL_NAMES = {
    "2698812145d22d42d61c043b9933d0771afdf0fad79a42fc985105d0f27141b0": "Maker",
    "d88eb2629f4cc00a052d4e86cd29a0be2b39e7b0c2fe1c459f7e4c1aa3d4df3b": "Yearn",
    "c94af803b7bf4f45b7e9822e53806f6d873074abc6cedbfccfa727bf00c623e6": "PieDao"
}