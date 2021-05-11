import settings


def get_cooldown_period():
    return settings.SHERLOCK_HTTP.functions.getCooldown().call()


def get_unstake_window():
    return settings.SHERLOCK_HTTP.functions.getUnstakeWindow().call()
