import requests

from settings import TOKENS

COINGECKO = "https://api.coingecko.com/api/v3/simple/price"

prices = None


def get_prices():
    global prices
    if prices:
        return prices
    prices = {}

    ids = []
    ids_to_address = {}
    for k, v in TOKENS.items():
        if k == "SHERX":
            # TODO, calculate right price
            prices[v["address"]] = 1.00 * 100000
        else:
            ids.append(v["coingecko"])
            ids_to_address[v["coingecko"]] = v["address"]

    payload = {"ids": ",".join(ids), "vs_currencies": ["usd"]}
    url = requests.get(COINGECKO, params=payload)
    for k, v in url.json().items():
        prices[ids_to_address[k]] = v["usd"] * 100000

    return prices


def get_price(address):
    return get_prices()[address]
