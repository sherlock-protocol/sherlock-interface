from web3 import Web3

import settings
from data.price import get_price, usd_price
from data.helper import human_format

def _get_staking_pool_token_data(total, total_fmo, symbol, data):
    stake = settings.SHERLOCK_CONTRACT_HTTP.functions.getLockToken(data["address"]).call()
    STAKE = settings.INFURA_HTTP.eth.contract(address=stake, abi=settings.ERC20_ABI)
    token = {
        "token": {
            "address": data["address"],
            "name": data["name"],
            "symbol": symbol,
            "decimals": data["decimals"],
        },
        "stake":{
            "address": stake,
            "name": STAKE.functions.name().call(),
            "symbol": STAKE.functions.symbol().call(),
            "decimals": STAKE.functions.decimals().call(),
        },
        "pool": {}
    }
    pool = token["pool"]

    # TVL
    pool["size"] = settings.SHERLOCK_CONTRACT_HTTP.functions.getStakersPoolBalance(data["address"]).call()
    pool["size_str"] = str(pool["size"])
    pool["size_format"] = "%.2f" % round(pool["size"] / data["divider"], 2)

    pool["usd_size"] = pool["size"] / data["divider"] * get_price(data["address"])
    pool["usd_size_str"] = "%.2f" % round(pool["usd_size"], 2)

    # Premium
    sherx_weight = settings.SHERLOCK_CONTRACT_HTTP.functions.getSherXWeight(data["address"]).call()
    pool["sherx_percentage"] = "%.2f" % round(float(sherx_weight / 10**16), 2)

    # Numba
    sherx_per_block = settings.SHERLOCK_CONTRACT_HTTP.functions.getTotalSherXPerBlock(data["address"]).call()
    premium_per_block =  get_price(settings.SHERLOCK_ADDRESS) * sherx_per_block * data["divider"] / get_price(data["address"]) / 10**18
    # TODO int to float? to keep precision
    pool["numba"] = int(premium_per_block / 260) # 1 block = 13 seconds. So 260 of these increments per block
    pool["numba_str"] = str(pool["numba"])
    pool["usd_numba"] = pool["numba"] * get_price(data["address"])
    pool["usd_numba_str"] = str(pool["usd_numba"])

    # Apy
    premium_per_year = premium_per_block * settings.BLOCKS_PER_YEAR
    if pool["size"] == 0:
        pool["apy"] = str(99999999.99)
    else:
        pool["apy"]  = "%.2f" % round(float(premium_per_year) / pool["size"], 2)

    # First money out
    pool["first_money_out"] = settings.SHERLOCK_CONTRACT_HTTP.functions.getFirstMoneyOut(data["address"]).call()
    pool["first_money_out_str"] = str(pool["first_money_out"])
    pool["first_money_out_usd"] = pool["first_money_out"] / data["divider"] * get_price(data["address"])
    pool["first_money_out_usd_str"] = str(pool["first_money_out_usd"])
    pool["first_money_out_usd_format"] = human_format(pool["first_money_out_usd"])

    unalloc = settings.SHERLOCK_CONTRACT_HTTP.functions.getUnallocatedSherXTotal(data["address"]).call()
    total += unalloc * get_price(settings.SHERLOCK_ADDRESS) / 10**18
    total += pool["usd_size"]
    total_fmo += pool["first_money_out_usd"]

    return total, total_fmo, token


def get_total_numba():
    sherx_total = settings.SHERLOCK_CONTRACT_HTTP.functions.getSherXPerBlock().call()
    sherx_total_50ms = int(sherx_total / 260) # 1 block = 13 seconds. So 260 of these increments per block
    return sherx_total_50ms / 10**18 * get_price(settings.SHERLOCK_ADDRESS)


def get_staking_pool_data():
    total = 0
    total_fmo = 0
    tokens = []

    for symbol, data in settings.TOKENS.items():
        if not settings.SHERLOCK_CONTRACT_HTTP.functions.isStake(data["address"]).call():
            continue

        total, total_fmo, token = _get_staking_pool_token_data(total, total_fmo, symbol, data)
        tokens.append(token)

    total_numba = get_total_numba()
    return {
        "tokens": tokens,
        "total": total,
        "usd_total_format": "%.2f" % round(total, 2),
        "usd_total_numba": total_numba,
        "usd_total_numba_str": str(total_numba),
        "usd_first_money_numba": 0,
        "usd_first_money_numba_str": str(0),
        "usd_first_money_out": total_fmo,
        "usd_first_money_out_str": '{:20,.2f}'.format(total_fmo).strip(),
        "usd_values": usd_price
    }
