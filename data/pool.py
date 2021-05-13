import os

from web3 import Web3

import settings
from data import price, helper

TIMESTAMP_ERROR = 0
if os.environ.get("FLASK_ENV") == 'development':
    TIMESTAMP_ERROR = -67


def _get_staking_pool_token_data(total, total_fmo, symbol, data):
    stake = settings.SHERLOCK_HTTP.functions.getLockToken(
        data["address"]).call()
    STAKE = settings.INFURA_HTTP.eth.contract(
        address=stake, abi=settings.ERC20_ABI)

    try:
        xrate = settings.SHERLOCK_HTTP.functions.LockToTokenXRate(
            data["address"]).call()
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
        "stake": {
            "address": stake,
            "name": STAKE.functions.name().call(),
            "symbol": STAKE.functions.symbol().call().lower(),
            "decimals": STAKE.functions.decimals().call(),
        },
        "xrate": xrate,
        "xrate_str": xrate_str,
        "pool": {}
    }
    pool = token["pool"]

    # TVL
    pool["size"] = settings.SHERLOCK_HTTP.functions.getStakersPoolBalance(
        data["address"]).call()
    pool["size_str"] = str(pool["size"])
    pool["size_format"] = "%.2f" % round(pool["size"] / data["divider"], 2)

    pool["usd_size"] = pool["size"] / \
        data["divider"] * price.get_price(data["address"])
    pool["usd_size_str"] = "%.2f" % round(pool["usd_size"], 2)

    # Premium
    sherx_weight = settings.SHERLOCK_HTTP.functions.getSherXWeight(
        data["address"]).call()
    pool["sherx_percentage"] = "%.2f" % round(float(sherx_weight / 10**16), 2)

    # Numba
    sherx_per_block = settings.SHERLOCK_HTTP.functions.getTotalSherXPerBlock(
        data["address"]).call()
    premium_per_block = price.get_price(settings.SHERLOCK) * sherx_per_block * \
        data["divider"] / price.get_price(data["address"]) / 10**18

    # TODO int to float? to keep precision
    # 1 block = 13 seconds. So 260 of these increments per block
    if data["address"] == settings.SHERLOCK:
        pool["numba"] = int(premium_per_block / 260)
        pool["numba_str"] = str(pool["numba"])
        pool["usd_numba"] = pool["numba"] * \
            price.get_price(data["address"]) / data["divider"]
        pool["usd_numba_str"] = str(pool["usd_numba"])
    else:
        pool["numba"] = int(premium_per_block / 260)
        pool["numba_str"] = str(pool["numba"])
        pool["usd_numba"] = 0
        pool["usd_numba_str"] = "0"

    # Apy
    premium_per_year = premium_per_block * settings.BLOCKS_PER_YEAR
    if pool["size"] == 0:
        pool["apy"] = str(99999999.99)
    else:
        pool["apy"] = "%.2f" % round(float(premium_per_year) / pool["size"], 2)

    # First money out
    pool["first_money_out"] = settings.SHERLOCK_HTTP.functions.getFirstMoneyOut(
        data["address"]).call()
    pool["first_money_out_str"] = str(pool["first_money_out"])
    pool["first_money_out_usd"] = pool["first_money_out"] / \
        data["divider"] * price.get_price(data["address"])
    pool["first_money_out_usd_str"] = str(pool["first_money_out_usd"])
    pool["first_money_out_usd_format"] = helper.human_format(
        pool["first_money_out_usd"])

    unalloc = settings.SHERLOCK_HTTP.functions.getUnallocatedSherXTotal(
        data["address"]).call()
    total += unalloc * price.get_price(settings.SHERLOCK) / 10**18
    total += pool["usd_size"]
    total_fmo += pool["first_money_out_usd"]

    return total, total_fmo, token


def get_total_numba():
    sherx_total = settings.SHERLOCK_HTTP.functions.getSherXPerBlock().call()
    # 1 block = 13 seconds. So 260 of these increments per block
    sherx_total_50ms = int(sherx_total / 260)
    return sherx_total_50ms / 10**18 * price.get_price(settings.SHERLOCK)


def get_staking_pool_data():
    total = 0
    total_fmo = 0
    tokens = []

    for symbol, data in settings.TOKENS.items():
        if not settings.SHERLOCK_HTTP.functions.isStake(data["address"]).call():
            continue

        total, total_fmo, token = _get_staking_pool_token_data(
            total, total_fmo, symbol, data)
        tokens.append(token)

    total_numba = get_total_numba()

    last_block = settings.INFURA_HTTP.eth.get_block_number()
    last_block_data = settings.INFURA_HTTP.eth.get_block(last_block)

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
