import time
import os
import json

from settings import INDEXER_TIMEOUT
from data import pool, tokens, price, protocols, sherlock, sherx, state

INDENT = None
SORT_KEYS = False
if os.environ.get("FLASK_ENV") == "development":
    INDENT = 4
    SORT_KEYS = True

ROOT = "indexer"

COOLDOWN_PERIOD = os.path.join(ROOT, "cooldown.json")
UNSTAKE_WINDOW = os.path.join(ROOT, "unstake.json")
POOL = os.path.join(ROOT, "pool.json")
TOKENS = os.path.join(ROOT, "tokens.json")
PREMIUM = os.path.join(ROOT, "premium.json")
COVERED = os.path.join(ROOT, "covered.json")
PRICES = os.path.join(ROOT, "prices.json")
SHERX = os.path.join(ROOT, "sherx.json")
STATE = os.path.join(ROOT, "state.json")


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


if __name__ == "__main__":
    while True:
        run()
        time.sleep(INDEXER_TIMEOUT)
