from web3 import Web3

import settings
from data.price import get_price, usd_price
from data.helper import human_format

def get_staking_pool_data():
    total = 0
    total_numba = 0
    tokens = []

    total_fmo = 0

    sherx_total = settings.SHERLOCK_CONTRACT_HTTP.functions.getSherXPerBlock().call()
    sherx_total_50ms = int(sherx_total / 260) # 1 block = 13 seconds. So 260 of these increments per block
    sherx_total_50ms_usd = sherx_total_50ms / 10**18 * get_price(settings.SHERLOCK_ADDRESS)
    total_numba = sherx_total_50ms_usd

    for symbol, data in settings.TOKENS.items():
        if not settings.SHERLOCK_CONTRACT_HTTP.functions.isStake(data["address"]).call():
            continue

        stake = settings.SHERLOCK_CONTRACT_HTTP.functions.getLockToken(data["address"]).call()
        STAKE = settings.INFURA_HTTP.eth.contract(address=stake, abi=settings.ERC20_ABI)

        # TVL
        tvl = settings.SHERLOCK_CONTRACT_HTTP.functions.getStakersPoolBalance(data["address"]).call()
        tvl_usd = tvl / data["divider"] * get_price(data["address"])
        total += tvl_usd

        # Premium
        sherx_per_block = settings.SHERLOCK_CONTRACT_HTTP.functions.getTotalSherXPerBlock(data["address"]).call()
        # TODO calculate by weights
        sherx_percentage = "%.2f" % round(float(sherx_per_block * 100) / sherx_total, 2)

        # use exchange rate
        premium_per_block =  get_price(settings.SHERLOCK_ADDRESS) * sherx_per_block * data["divider"] / get_price(data["address"]) / 10**18
        premium_per_50ms = float(premium_per_block / 260) # 1 block = 13 seconds. So 260 of these increments per block
        premium_per_50ms_usd = premium_per_50ms * get_price(data["address"])
        premium_per_year = premium_per_block * settings.BLOCKS_PER_YEAR

        if tvl == 0:
            apy = str(99999999.99)
        else:
            apy = "%.2f" % round(float(premium_per_year) / tvl, 2)

        # First money out
        first_money_out = settings.SHERLOCK_CONTRACT_HTTP.functions.getFirstMoneyOut(data["address"]).call()
        first_money_out_usd = first_money_out / data["divider"] * get_price(data["address"])
        total_fmo += first_money_out_usd

        tokens.append({
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
            "pool": {
                "size": tvl,
                "size_str": str(tvl),
                "size_format": "%.2f" % round(tvl / data["divider"], 2),
                "numba": premium_per_50ms,
                "numba_str": str(premium_per_50ms),
                "usd_size": tvl_usd,
                "usd_size_str": "%.2f" % round(tvl_usd, 2),
                "usd_numba": premium_per_50ms_usd,
                "usd_numba_str": str(premium_per_50ms_usd),
                #"usd_numba_format": "%.2f" % round(premium_per_50ms_usd, 2),
                "apy": apy,
                "first_money_out": first_money_out,
                "first_money_out_str": str(first_money_out),
                "first_money_out_usd": first_money_out_usd,
                "first_money_out_usd_str": first_money_out_usd,
                "first_money_out_usd_format": human_format(first_money_out_usd),
                "sherx_percentage": sherx_percentage
            }
        })

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
