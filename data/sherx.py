import settings
from data.tokens import get_tokens
from data.price import get_prices


def get_underlying():
    all_tokens = get_tokens()
    all_prices = get_prices()
    data = {}

    usd_total = 0

    ul = settings.SHERLOCK_HTTP.functions.calcUnderlying(10**18).call()
    tokens, amounts = ul
    for i in range(len(tokens)):
        token = tokens[i]
        divider = all_tokens[token]["divider"]
        x = data[token] = {}

        x["token"] = all_tokens[token]
        x["amount"] = amounts[i]
        x["amount_str"] = str(x["amount"])
        x["amount_usd"] = x["amount"] / divider * all_prices[token]
        x["amount_usd_str"] = str(x["amount_usd"])
        x["amount_usd_format"] = '{:20,.2f}'.format(
            x["amount_usd"]/100000).strip()

        usd_total += x["amount_usd"]

    for i in range(len(tokens)):
        token = tokens[i]
        x = data[token]
        x["percentage"] = round(x["amount_usd"] / usd_total * 100, 2)
        x["percentage_str"] = str(x["percentage"])

    return data
