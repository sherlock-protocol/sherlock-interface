import settings
from web3 import Web3

blocks_per_day = 6484
blocks_per_year = blocks_per_day * 365

def get_staking_pool_data():
    total = 0
    data = []

    filter = settings.POOL_CONTRACT_HTTP.events.TokenAdded.createFilter(fromBlock="0x0")
    for ev in filter.get_all_entries():
        token = ev.args._token
        stake = ev.args._stake

        TOKEN = settings.INFURA_HTTP.eth.contract(address=token, abi=settings.ERC20_ABI)
        STAKE = settings.INFURA_HTTP.eth.contract(address=stake, abi=settings.ERC20_ABI)

        tvl = settings.POOL_CONTRACT_HTTP.functions.getStakersTVL(token).call()
        total += tvl

        premium_per_block = settings.POOL_CONTRACT_HTTP.functions.getTotalPremiumPerBlock(token).call()
        premium_per_50ms = int(premium_per_block / 260) # 1 block = 13 seconds. So 260 of these increments per block
        premium_per_year = premium_per_block * blocks_per_year
        if tvl == 0:
            apy = 9999999.99
        else:
            apy = "%.2f" % round(float(premium_per_year) / tvl, 2)

        data.append({
            "token": {
                "address": token,
                "name": TOKEN.functions.name().call(),
                "symbol": TOKEN.functions.symbol().call(),
                "decimals": TOKEN.functions.decimals().call(),
            },
            "stake":{
                "address": stake,
                "name": STAKE.functions.name().call(),
                "symbol": STAKE.functions.symbol().call(),
                "decimals": STAKE.functions.decimals().call(),
            },
            "pool": {
                "numba": premium_per_50ms,
                "numba_str": str(premium_per_50ms),
                "size": str(tvl),
                "apy": apy
            },
        })
    return data, total

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

