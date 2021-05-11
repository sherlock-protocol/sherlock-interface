from settings import TOKENS


def get_tokens():
    d = {}
    for k, v in TOKENS.items():
        d[v["address"]] = {
            "name": v["name"],
            "symbol": k,
            "decimals": v["decimals"]
        }
    return d
