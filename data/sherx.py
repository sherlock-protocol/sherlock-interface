import settings
from data.tokens import get_tokens
from data.price import get_prices


def get_underlying():
    all_tokens = get_tokens()
    all_prices = get_prices()
    data = {}

    ul = settings.SHERLOCK_HTTP.functions.calcUnderlying(10**18).call()
    tokens, amounts = ul
    for i in range(len(tokens)):
        token = tokens[i]
        divider = all_tokens[token]["divider"]
        x = data[token] = {}

        x["amount"] = amounts[i]
        x["amount_str"] = str(x["amount"])
        x["amount_usd"] = x["amount"] / divider * all_prices[token]
        x["amount_usd_str"] = str(x["amount_usd"])
        x["amount_usd_format"] = '{:20,.2f}'.format(
            x["amount_usd"]/100000).strip()

        x["percentage"] = round(
            x["amount_usd"] / all_prices[settings.SHERLOCK] * 100, 2)
        x["percentage_str"] = str(x["percentage"])

    return data
