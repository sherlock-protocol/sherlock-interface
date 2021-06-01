import os
import json

from settings import NETWORK, SHERLOCK_HTTP, ERC20_ABI, INFURA_HTTP, COINGECKO_IDS, WORKER_ROOT

INDENT = None
SORT_KEYS = False
if os.environ.get("FLASK_ENV") == "development":
    INDENT = 4
    # Keep false otherwise order of tokens changes on dashboard
    SORT_KEYS = False

def get_tokens():
    tokens = {}
    address = []

    _tokens = SHERLOCK_HTTP.functions.getTokensStaker().call()
    _sherx = SHERLOCK_HTTP.functions.getTokensSherX().call()
    _tokens.extend(x for x in _sherx if x not in _tokens)

    for token in _tokens:
        w = INFURA_HTTP.eth.contract(address=token, abi=ERC20_ABI)
        token_decimals = w.functions.decimals().call()
        symbol = w.functions.symbol().call()
        tokens[symbol] = {
            "address": token,
            "name":  w.functions.name().call(),
            "decimals": token_decimals,
            "divider": float("1" + "0" * token_decimals),

            "coingecko": COINGECKO_IDS.get(symbol, symbol.lower())
        }

        address.append(token)
    return tokens, address

def get_lock(address):
    lock = {}

    for add in address:
        stake = SHERLOCK_HTTP.functions.getLockToken(add).call()
        if stake == "0x0000000000000000000000000000000000000000":
            continue
        STAKE = INFURA_HTTP.eth.contract(address=stake, abi=ERC20_ABI)
        lock[add] = {
            "address": stake,
            "name": STAKE.functions.name().call(),
            "symbol": STAKE.functions.symbol().call().lower(),
            "decimals": STAKE.functions.decimals().call(),
        }

    return lock

def index():
    token, address = get_tokens()
    locked = get_lock(address)

    path = os.path.join(WORKER_ROOT, "%s.json" % NETWORK)
    with open(path, "w") as f:
        json.dump({
            "token": token,
            "lock": locked
        }, f, indent=INDENT, sort_keys=SORT_KEYS)


if __name__ == "__main__":
    index()


