import settings
from web3 import Web3

def get_staking_pool_data():
    # return {'staked_funds': "15,069,244.62", 'apy': "11.39", "lockup": "3"}
    # todo lockup

    stakedFunds = settings.POOL_CONTRACT_HTTP.functions.getTVL().call()
    # todo calculate apy
    # todo lockup
    return {
        "staked_funds": '{:,.2f}'.format(Web3.fromWei(stakedFunds, 'ether')),
        "staked_funds_big": stakedFunds,
        "yield": "500000000000000000",
        "apy": 11.39,
        "lockup": 3
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

def get_tokens():
    data = {}
    tokens = settings.POOL_CONTRACT_HTTP.functions.getWhitelistedTokens().call()
    for address in tokens:
        ERC20 = settings.INFURA_HTTP.eth.contract(address=address, abi=settings.ERC20_ABI)
        symbol = ERC20.functions.symbol().call()
        data[symbol] = address

    return data
