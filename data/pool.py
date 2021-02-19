import settings

def get_staking_pool_data():
    return {'staked_funds': "15,069,244.62", 'apy': "11.39"}

    stakedFunds = settings.POOL_CONTRACT_HTTP.functions.getTotalStakedFunds().call()
    # todo calculate apy
    return {
        "staked_funds": stakedFunds,
        "apy": 12544430000000000000
    }

def get_covered_protocols():
    return [{'id': '2698812145d22d42d61c043b9933d0771afdf0fad79a42fc985105d0f27141b0', 'name': 'Maker', 'covered': 11000000000000000000000000, 'premium': 95129375946000000, 'balance': 0, 'last_paid': 23343713, 'profile': [11000000000000000000000000, 8648125086]}, {'id': 'd88eb2629f4cc00a052d4e86cd29a0be2b39e7b0c2fe1c459f7e4c1aa3d4df3b', 'name': 'Yearn', 'covered': 9000000000000000000000000, 'premium': 77833125774000000, 'balance': 0, 'last_paid': 23343719, 'profile': [9000000000000000000000000, 8648125086]}, {'id': 'c94af803b7bf4f45b7e9822e53806f6d873074abc6cedbfccfa727bf00c623e6', 'name': 'PieDao', 'covered': 5000000000000000000000000, 'premium': 43240625430000000, 'balance': 0, 'last_paid': 23343725, 'profile': [5000000000000000000000000, 8648125086]}]
    data = []

    amountOfProtocolsCovered = settings.POOL_CONTRACT_HTTP.functions.amountOfProtocolsCovered().call()
    for i in range(amountOfProtocolsCovered):
        id = settings.POOL_CONTRACT_HTTP.functions.protocols(i).call()
        coveredFunds = settings.POOL_CONTRACT_HTTP.functions.coveredFunds(id).call()
        premiumPerBlock = settings.POOL_CONTRACT_HTTP.functions.premiumPerBlock(id).call()
        balance = settings.POOL_CONTRACT_HTTP.functions.profileBalances(id).call()
        lastPaid = settings.POOL_CONTRACT_HTTP.functions.profilePremiumLastPaid(id).call()
        profile = settings.POOL_CONTRACT_HTTP.functions.profiles(id).call()
        data.append({
            "id": str(id.hex()),
            "name": settings.PROTOCOL_NAMES.get(str(id.hex())),
            "covered":coveredFunds,
            "premium":premiumPerBlock,
            "balance":balance,
            "last_paid":lastPaid,
            "profile":profile
        })
    return data

def get_pool_strategies():
    return [{'name': 'ATokenV2StrategyToAave', 'token_address': '0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD', 'strategy_address': '0x5852A4a9687dAFFCd5464a2790d3F4d5E5001A69', 'oracle_address': '0x0000000000000000000000000000000000000000', 'balance': 14121785424705346597586066}, {'name': 'AaveStrategyToUniswap', 'token_address': '0x85821C543d5773cA19b91F5b37e39FeC308C6FA7', 'strategy_address': '0xBb8974C5F93ED2935E4E0d9abC95551310c48F62', 'oracle_address': '0xb3Ef934755f162e2Aa1c7Aae4CD6167aE2694d25', 'balance': 182203692109052093154252}]
    data = []
    amountOfStrategies = settings.SM_CONTRACT_HTTP.functions.amountOfStrategies().call()
    for i in range(amountOfStrategies):
        token = settings.SM_CONTRACT_HTTP.functions.tokens(i).call()
        strategy = settings.SM_CONTRACT_HTTP.functions.strategies(token).call()
        if strategy == "0x5852A4a9687dAFFCd5464a2790d3F4d5E5001A69":
            name = "ATokenV2StrategyToAave"
        elif strategy == "0xBb8974C5F93ED2935E4E0d9abC95551310c48F62":
            name = "AaveStrategyToUniswap"
        oracle = settings.SM_CONTRACT_HTTP.functions.priceOracle(token).call()
        balance = settings.SM_CONTRACT_HTTP.functions.balanceOf(token).call()
        data.append({
            "name": name,
            "token_address": token,
            "strategy_address": strategy,
            "oracle_address":oracle,
            "balance":balance,
        })
    return data

