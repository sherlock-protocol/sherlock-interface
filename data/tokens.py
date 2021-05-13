from settings import TOKENS


def get_tokens():
    d = {}
    for k, v in TOKENS.items():
        d[v["address"]] = {
            "name": v["name"],
            "symbol": k.lower(),
            "decimals": v["decimals"]
        }
    return d
