import settings
from web3 import Web3

blocks_per_day = 6484
blocks_per_year = blocks_per_day * 365

usd_price = {
    '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707': 1.00,
    '0x0165878A594ca255338adfa4d48449f69242Eb8F': 1.01,
    '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853': 400.00,
    '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6': 1500.00
}

def get_staking_pool_data():
    total = 0
    total_numba = 0
    tokens = []

    filter = settings.POOL_CONTRACT_HTTP.events.TokenAdded.createFilter(fromBlock="0x0")
    for ev in filter.get_all_entries():
        token = ev.args._token
        stake = ev.args._stake

        TOKEN = settings.INFURA_HTTP.eth.contract(address=token, abi=settings.ERC20_ABI)
        token_decimals = TOKEN.functions.decimals().call()
        divider = float("1" + "0" * token_decimals)
        STAKE = settings.INFURA_HTTP.eth.contract(address=stake, abi=settings.ERC20_ABI)

        tvl = settings.POOL_CONTRACT_HTTP.functions.getStakersTVL(token).call()
        tvl_usd = tvl / divider * usd_price[token]
        total += tvl_usd

        premium_per_block = settings.POOL_CONTRACT_HTTP.functions.getTotalPremiumPerBlock(token).call()
        premium_per_50ms = int(premium_per_block / 260) # 1 block = 13 seconds. So 260 of these increments per block
        premium_per_50ms_usd = premium_per_50ms / divider * usd_price[token]
        total_numba += premium_per_50ms_usd

        premium_per_year = premium_per_block * blocks_per_year
        if tvl == 0:
            apy = str(99999999.99)
        else:
            apy = "%.2f" % round(float(premium_per_year) / tvl, 2)

        tokens.append({
            "token": {
                "address": token,
                "name": TOKEN.functions.name().call(),
                "symbol": TOKEN.functions.symbol().call(),
                "decimals": token_decimals,
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
                "size_format": "%.2f" % round(tvl / divider, 2),
                "numba": premium_per_50ms,
                "numba_str": str(premium_per_50ms),
                "usd_size": tvl_usd,
                "usd_size_str": "%.2f" % round(tvl_usd, 2),
                "usd_numba": premium_per_50ms_usd,
                "usd_numba_str": str(premium_per_50ms_usd),
                #"usd_numba_format": "%.2f" % round(premium_per_50ms_usd, 2),
                "apy": apy
            },
        })
    return {
        "tokens": tokens,
        "total": total,
        "usd_total_str": str(total),
        "usd_total_format": "%.2f" % round(total, 2),
        "usd_total_numba": total_numba,
        "usd_total_numba_str": str(total_numba),
        "usd_values": usd_price
       # "usd_total_numba_format":  "%.2f" % round(total_numba, 2),
    }

def get_covered_protocols():
    return [
        {
            'id': '2698812145d22d42d61c043b9933d0771afdf0fad79a42fc985105d0f27141b0',
            'name': 'Maker',
            'covered': '11000000000000000000000000', # total usd
            'covered_breakdown': [
                {
                    "token": "x",
                    "amount": 1
                }
            ],
            'premium': '95129375946000000', # total usd
            'balance': '100', # total usd
            'pool_breakdown': [
                {
                    "token": "x",
                    "balance": 1,
                    "premium": 1,
                    "last_paid": 500,
                    "outstanding debt": 500
                }
            ],
        }
    ]
    data = []
    return data

def get_pool_strategies():
    #   return [{'name': 'ATokenV2StrategyToAave', 'token_address': '0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD', 'strategy_address': '0x5852A4a9687dAFFCd5464a2790d3F4d5E5001A69', 'oracle_address': '0x0000000000000000000000000000000000000000', 'balance': "14121785424705346597586066"}, {'name': 'AaveStrategyToUniswap', 'token_address': '0x85821C543d5773cA19b91F5b37e39FeC308C6FA7', 'strategy_address': '0xBb8974C5F93ED2935E4E0d9abC95551310c48F62', 'oracle_address': '0xb3Ef934755f162e2Aa1c7Aae4CD6167aE2694d25', 'balance': "182203692109052093154252"}]
    data = []
    return data

