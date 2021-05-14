import time
import json
import copy

from cachetools import cached, TTLCache

import indexer
import settings

from data.protocols import PROTOCOL_META

CACHE_TIME = 10


class sherx:
    @cached(cache=TTLCache(maxsize=1, ttl=CACHE_TIME))
    def get_underlying():
        with open(indexer.SHERX, "r") as f:
            return json.load(f)


class pool:
    def get_staking_pool_data():
        data = copy.deepcopy(pool.get_staking_pool_data_stored())

        diff = time.time() - data["block_timestamp"]
        if diff < 0:
            return data

        diff_ms = diff * 1000
        data["usd_total"] += diff_ms / 50 * data["usd_total_numba"]
        data["usd_total_str"] = str(data["usd_total"])
        data["usd_total_format"] = '{:20,.2f}'.format(
            data["usd_total"]/100000).strip()

        # TODO only do this for SHERX
        for token in data["tokens"]:
            divider = settings.TOKENS[token["token"]
                                      ["symbol"].upper()]["divider"]

            if token["token"]["address"] != settings.SHERLOCK:
                continue
            token["pool"]["size"] += int(diff_ms / 50 * token["pool"]["numba"])
            token["pool"]["size_str"] = str(token["pool"]["size"])
            token["pool"]["size_format"] = "%.2f" % round(
                token["pool"]["size"] / divider, 2)

            token["pool"]["usd_size"] = token["pool"]["size"] / \
                divider * price.get_prices()[token["token"]["address"]]
            token["pool"]["usd_size_str"] = "%.2f" % round(
                token["pool"]["usd_size"], 2)
        return data

    @cached(cache=TTLCache(maxsize=1, ttl=CACHE_TIME))
    def get_staking_pool_data_stored():
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
