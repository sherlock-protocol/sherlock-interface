import json

from cachetools import cached, TTLCache

import indexer
from data.protocols import PROTOCOL_META

CACHE_TIME = 10


class pool:
    @cached(cache=TTLCache(maxsize=1, ttl=CACHE_TIME))
    def get_staking_pool_data():
        with open(indexer.POOL, "r") as f:
            return json.load(f)


class tokens:
    @cached(cache=TTLCache(maxsize=1, ttl=CACHE_TIME))
    def get_tokens():
        with open(indexer.TOKENS, "r") as f:
            return json.load(f)


class price:
    @cached(cache=TTLCache(maxsize=1, ttl=CACHE_TIME))
    def get_prices():
        with open(indexer.PRICES, "r") as f:
            return json.load(f)


class protocols:
    PROTOCOL_META = PROTOCOL_META

    @cached(cache=TTLCache(maxsize=1, ttl=CACHE_TIME))
    def get_protocols_premium():
        with open(indexer.PREMIUM, "r") as f:
            return json.load(f)

    @cached(cache=TTLCache(maxsize=1, ttl=CACHE_TIME))
    def get_protocols_covered():
        with open(indexer.COVERED, "r") as f:
            return json.load(f)


class sherlock:
    @cached(cache=TTLCache(maxsize=1, ttl=CACHE_TIME))
    def get_cooldown_period():
        with open(indexer.COOLDOWN_PERIOD, "r") as f:
            return json.load(f)

    @cached(cache=TTLCache(maxsize=1, ttl=CACHE_TIME))
    def get_unstake_window():
        with open(indexer.UNSTAKE_WINDOW, "r") as f:
            return json.load(f)
