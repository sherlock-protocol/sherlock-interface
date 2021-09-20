import time
import os
import json
import requests

from settings import INDEXER_TIMEOUT, WORKER_ROOT, NETWORK, SHERLOCK, ETHERSCAN, TG_BOT, TG_RECEIVER
from data import pool, tokens, price, protocols, sherlock, sherx, state

INDENT = None
SORT_KEYS = False
if os.environ.get("FLASK_ENV") == "development":
    INDENT = 4
    SORT_KEYS = True

COOLDOWN_PERIOD = os.path.join(WORKER_ROOT, "cooldown.json")
UNSTAKE_WINDOW = os.path.join(WORKER_ROOT, "unstake.json")
POOL = os.path.join(WORKER_ROOT, "pool.json")
TOKENS = os.path.join(WORKER_ROOT, "tokens.json")
PREMIUM = os.path.join(WORKER_ROOT, "premium.json")
COVERED = os.path.join(WORKER_ROOT, "covered.json")
PRICES = os.path.join(WORKER_ROOT, "prices.json")
SHERX = os.path.join(WORKER_ROOT, "sherx.json")
STATE = os.path.join(WORKER_ROOT, "state.json")


def run():
    data = sherlock.get_cooldown_period()
    with open(COOLDOWN_PERIOD, "w") as f:
        json.dump(data, f, indent=INDENT, sort_keys=SORT_KEYS)

    data = sherlock.get_unstake_window()
    with open(UNSTAKE_WINDOW, "w") as f:
        json.dump(data, f, indent=INDENT, sort_keys=SORT_KEYS)

    data = pool.get_staking_pool_data()
    with open(POOL, "w") as f:
        json.dump(data, f, indent=INDENT, sort_keys=SORT_KEYS)

    data = tokens.get_tokens()
    with open(TOKENS, "w") as f:
        json.dump(data, f, indent=INDENT, sort_keys=SORT_KEYS)

    data = protocols.get_protocols_premium()
    with open(PREMIUM, "w") as f:
        json.dump(data, f, indent=INDENT, sort_keys=SORT_KEYS)

    data = protocols.get_protocols_covered()
    with open(COVERED, "w") as f:
        json.dump(data, f, indent=INDENT, sort_keys=SORT_KEYS)

    data = price.get_prices()
    with open(PRICES, "w") as f:
        json.dump(data, f, indent=INDENT, sort_keys=SORT_KEYS)

    data = sherx.get_underlying()
    with open(SHERX, "w") as f:
        json.dump(data, f, indent=INDENT, sort_keys=SORT_KEYS)

    data = state.get_state()
    with open(STATE, "w") as f:
        json.dump(data, f, indent=INDENT, sort_keys=SORT_KEYS)


_prev_number = 0

def verify_run():
    global _prev_number

    if NETWORK == "LOCALHOST":
        return True
    if NETWORK == "KOVAN":
        url = "https://api-kovan.etherscan.io/api"
    if NETWORK == "MAINNET":
        url = "https://api.etherscan.io/api"

    payload = {
        "module": "account",
        "action": "txlist",
        "address": SHERLOCK,
        "startblock": 0,
        "endblock":99999999,
        "page": 1,
        "offset": 1,
        "sort": "desc",
        "apikey": ETHERSCAN
    }
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36"}
    try:
        r = requests.get(url, params=payload, headers=headers)
        b = int(r.json()["result"][0]["blockNumber"])
        if b > _prev_number:
            _prev_number = b
            return True
        return False
    except Exception as e:
        print(e)
    return True

def tg_msg(msg):
    url = "https://api.telegram.org/bot%s/sendMessage" % TG_BOT
    data = {
        "chat_id": TG_RECEIVER,
        "text": msg
    }
    requests.post(url, json=data)


def loop():
    while True:
        if verify_run():
            run()
        time.sleep(INDEXER_TIMEOUT)


def loop_catcher():
    while True:
        try:
            loop()
        except Exception as e:
            print(e)
            tg_msg(str(e))
        time.sleep(300)


if __name__ == "__main__":
    loop_catcher()
