import os

from web3 import Web3

from settings import DATA, INFURA_HTTP, ERC20_ABI, SHERLOCK_HTTP, SHERLOCK, BLOCKS_PER_YEAR, TOKENS, TIMESTAMP_ERROR
from data import price, helper, aave

def _get_staking_pool_token_data(total, total_fmo, symbol, data):
    try:
        xrate = SHERLOCK_HTTP.functions.LockToTokenXRate(data["address"]).call()
        xrate = xrate
        xrate_str = str(round(xrate / data["divider"], 2))
    except ValueError:
        xrate = "~"
        xrate_str = "~"

    token = {
        "token": {
            "address": data["address"],
            "name": data["name"],
            "symbol": symbol.lower(),
            "decimals": data["decimals"],
        },
        "stake": DATA["lock"][data["address"]],
        "xrate": xrate,
        "xrate_str": xrate_str,
        "pool": {}
    }
    pool = token["pool"]

    # TVL
    pool["size"] = pool["staker_size"] = SHERLOCK_HTTP.functions.getStakersPoolBalance(
        data["address"]).call()

    pool["staker_size_str"] = str(pool["staker_size"])

    pool["size_str"] = str(pool["size"])
    pool["size_format"] = "%.2f" % round(pool["size"] / data["divider"], 2)

    pool["usd_size"] = pool["size"] / \
        data["divider"] * price.get_price(data["address"])

    pool["usd_size_str"] = "%.2f" % round(pool["usd_size"], 2)
    pool["usd_size_str_format"] = helper.human_format(
        pool["usd_size"] / 100000)

    # Premium
    sherx_weight = SHERLOCK_HTTP.functions.getSherXWeight(data["address"]).call()
    pool["sherx_percentage"] = "%.2f" % round(float(sherx_weight / 10**16), 2)

    # Numba
    sherx_per_block = SHERLOCK_HTTP.functions.getTotalSherXPerBlock(
        data["address"]).call()
    premium_per_block = price.get_price(SHERLOCK) * sherx_per_block * \
        data["divider"] / price.get_price(data["address"]) / 10**18

    pool["aave_apy"] = aave.get_apy(data["address"])
    if pool["aave_apy"]:
        expect_apy = pool["size"] * pool["aave_apy"] / 100
        pool["numba_stake"] = int(expect_apy/31556926/20)

        usd_yield = aave.get_numba(data["address"])
    else:
        pool["numba_stake"] = 0
        usd_yield = 0

    pool["numba_stake_str"] = str(pool["numba_stake"])

    # TODO int to float? to keep precision
    # 1 block = 13 seconds. So 260 of these increments per block
    pool["numba_sherx"] = int(premium_per_block / 260)
    pool["numba_sherx_str"] = str(pool["numba_sherx"])

    pool["numba"] = int(pool["numba_stake"] + pool["numba_sherx"])
    pool["numba_str"] = str(pool["numba"])


    # Apy
    premium_per_year = premium_per_block * BLOCKS_PER_YEAR
    if pool["size"] == 0:
        if sherx_per_block > 0.0:
            pool["premium_apy"] = 99999999.99
        else:
            pool["premium_apy"] = 0
    else:
        pool["premium_apy"] = round(float(premium_per_year) / pool["size"], 2) * 100

    if pool["aave_apy"]:
        pool["total_apy"] = "%.2f" % (pool["premium_apy"] + pool["aave_apy"])
        pool["aave_apy"] = "%.2f" % pool["aave_apy"]
    else:
        pool["total_apy"] = "%.2f" % pool["premium_apy"]
    pool["premium_apy"] = "%.2f" % pool["premium_apy"]



    # First money out
    pool["first_money_out"] = SHERLOCK_HTTP.functions.getFirstMoneyOut(
        data["address"]).call()
    pool["first_money_out_str"] = str(pool["first_money_out"])
    pool["first_money_out_usd"] = pool["first_money_out"] / \
        data["divider"] * price.get_price(data["address"])
    pool["first_money_out_usd_str"] = str(pool["first_money_out_usd"])
    pool["first_money_out_usd_format"] = helper.human_format(
        pool["first_money_out_usd"])

    # unalloc = SHERLOCK_HTTP.functions.getUnallocatedSherXTotal(
    #     data["address"]).call()
    # total += unalloc * price.get_price(SHERLOCK) / 10**18
    total += pool["usd_size"]
    total_fmo += pool["first_money_out_usd"]

    return total, total_fmo, token, usd_yield


def get_total_numba():
    # TODO add aave funds here
    sherx_total = SHERLOCK_HTTP.functions.getSherXPerBlock().call()
    # 1 block = 13 seconds. So 260 of these increments per block
    sherx_total_50ms = int(sherx_total / 260)
    return sherx_total_50ms / 10**18 * price.get_price(SHERLOCK)


def get_staking_pool_data():
    total = 0
    total_fmo = 0
    total_usd_yield = 0
    tokens = []

    for symbol, data in TOKENS.items():
        if not SHERLOCK_HTTP.functions.isStake(data["address"]).call():
            continue

        total, total_fmo, token, usd_yield = _get_staking_pool_token_data(
            total, total_fmo, symbol, data)
        total_usd_yield += usd_yield
        tokens.append(token)

    total_numba = get_total_numba()
    total_numba += total_usd_yield / 10
    last_block_data = INFURA_HTTP.eth.get_block("latest")

    return {
        "tokens": tokens,
        "usd_total": total,
        "usd_total_str": str(total),
        "usd_total_format": '{:20,.2f}'.format(total/100000).strip(),
        "usd_total_numba": total_numba,
        "usd_total_numba_str": str(total_numba),
        "usd_buffer_numba": 0,
        "usd_buffer_numba_str": str(0),
        "usd_buffer": total_fmo,
        "usd_buffer_str": str(total_fmo),
        "usd_buffer_format": '{:20,.2f}'.format(total_fmo/100000).strip(),
        "usd_values": price.get_prices(),
        "block_timestamp": last_block_data["timestamp"] + TIMESTAMP_ERROR
    }
