import settings

def get_apy(token):
    strat = settings.SHERLOCK_HTTP.functions.getStrategy(token).call()
    if strat == '0x0000000000000000000000000000000000000000':
        return None

    STATEGY_HTTP = settings.INFURA_HTTP.eth.contract(address=strat, abi=settings.STATEGY_ABI)

    totalBalance = settings.SHERLOCK_HTTP.functions.getStakersPoolBalance(token).call()
    stratBalance = STATEGY_HTTP.functions.balanceOf().call()
    strategy_percentage = float(stratBalance) / totalBalance

    aave = settings.AAVE_LP_HTTP.functions.getReserveData(token).call()
    total_yield_percetage = aave[3] / 10.0**25

    return strategy_percentage * total_yield_percetage / 100

def get_numba(token):
    strat = settings.SHERLOCK_HTTP.functions.getStrategy(token).call()
    if strat == '0x0000000000000000000000000000000000000000':
        return None

    STATEGY_HTTP = settings.INFURA_HTTP.eth.contract(address=strat, abi=settings.STATEGY_ABI)

    stratBalance = STATEGY_HTTP.functions.balanceOf().call()

    aave = settings.AAVE_LP_HTTP.functions.getReserveData(token).call()
    total_yield_percetage = aave[3] / 10.0**25 / 100

    return stratBalance*total_yield_percetage/31556926/20
