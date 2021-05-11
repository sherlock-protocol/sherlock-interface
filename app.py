from web3 import Web3
from flask import Flask, render_template, request

import settings
from data import pool, tokens, price, protocols, sherlock

app = Flask(__name__, template_folder="templates")


def env():
    return {
        "network": settings.NETWORK,
        "chainid": settings.CHAINID,
        "infura": settings.INFURA_TOKEN,
        "pool_address": settings.SHERLOCK,
        "wallet": request.cookies.get('wallet')
    }


@app.route('/')
def dashboard():
    return render_template(
        'dashboard.html',
        title='Dashboard',
        desc='dashboard',
        tags=["dashboard"],
        currentPage="dashboard",
        env=env(),
        data={
            "pool": pool.get_staking_pool_data(),
            "cooldown_period": sherlock.get_cooldown_period(),
            "unstake_window":  sherlock.get_unstake_window()
        }
    )


@app.route('/deposit/<address>')
def deposit(address):
    address = Web3.toChecksumAddress(address)
    for entry in pool.get_staking_pool_data()["tokens"]:
        if address == entry["token"]["address"]:
            return render_template(
                'deposit.html',
                title='Deposit',
                desc='deposit',
                tags=["deposit"],
                currentPage="deposit",
                env=env(),
                data={
                    "token": entry["token"],
                    "stake": entry["stake"]
                }
            )
    return "Not supported", 404


@app.route('/withdraw/<address>')
def withdraw(address):
    address = Web3.toChecksumAddress(address)
    for entry in pool.get_staking_pool_data()["tokens"]:
        if address == entry["token"]["address"]:
            return render_template(
                'withdraw.html',
                title='Withdraw',
                desc='withdraw',
                tags=["withdraw"],
                currentPage="withdraw",
                env=env(),
                data={
                    "token": entry["token"],
                    "stake": entry["stake"]
                }
            )
    return "Not supported", 404


@app.route('/breakdown')
def breakdown():
    covered, usd_total = protocols.get_protocols_covered()
    usd_total_format = '{:20,.2f}'.format(usd_total / 100000).strip()
    return render_template(
        'breakdown.html',
        title='Breakdown',
        desc='breakdown',
        tags=["breakdown"],
        currentPage="breakdown",
        env=env(),
        data={
            "tokens": tokens.get_tokens(),
            "protocols": protocols.get_protocols_premium(),
            "protocols_covered": covered,
            "protocol_meta": protocols.PROTOCOL_META,
            "usd": price.usd_price,
            "total_covered_usd": usd_total,
            "total_covered_usd_str": usd_total_format
        }
    )


if __name__ == '__main__':
    app.run(host=settings.SERVER_HOST, port=settings.SERVER_PORT)
