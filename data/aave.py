import settings

def get_apy(token):
    strat = settings.SHERLOCK_HTTP.functions.getStrategy(token).call()
    if strat == '0x0000000000000000000000000000000000000000':
        return None

    STATEGY_HTTP = settings.INFURA_HTTP.eth.contract(address=strat, abi=settings.STATEGY_ABI)

    totalBalance = settings.SHERLOCK_HTTP.functions.getStakersPoolBalance(token).call()
    stratBalance = STATEGY_HTTP.functions.balanceOf().call()
    percentage = float(stratBalance) / totalBalance

    aave = settings.AAVE_LP_HTTP.functions.getReserveData(token).call()
    return aave[3] / 10.0**25 * percentage