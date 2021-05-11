from settings import TOKENS


def get_prices():
    return {
        TOKENS['USDC']['address']: 1.00 * 100000,
        TOKENS['DAI']['address']: 1.01 * 100000,
        TOKENS['WETH']['address']: 3998.76 * 100000,
        TOKENS['WBTC']['address']: 49976.62 * 100000,
        TOKENS['SHERX']['address']: 1.00 * 100000,
        TOKENS['BADGER']['address']: 32.60 * 100000,
        TOKENS['ALCX']['address']: 1487.78 * 100000,
        TOKENS['AAVE']['address']: 390.32 * 100000,
        TOKENS['SUSHI']['address']: 15.32 * 100000,
    }


def get_price(address):
    return get_prices()[address]
