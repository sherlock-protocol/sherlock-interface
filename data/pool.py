import settings

def get_staking_pool_data():
    coveredFunds = settings.POOL_CONTRACT_HTTP.functions.getTotalStakedFunds().call()
    # todo calculate apy
    return {
        "covered_funds": coveredFunds,
        "apy": 12544430000000000000
    }

def get_covered_protocols():
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

