import settings

def get_apy(token):
    strat = settings.SHERLOCK_HTTP.functions.getStrategy(token).call()
    if strat == '0x0000000000000000000000000000000000000000':
        return None
    # TODO, currently expects the full 100% of tokens to be deposited in strategy

    aave = settings.AAVE_LP_HTTP.functions.getReserveData(token).call()
    return aave[3] / 10.0**25