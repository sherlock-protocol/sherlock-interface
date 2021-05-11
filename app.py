import settings
from web3 import Web3

from data import pool
from flask import Flask, render_template, request

from data.tokens import get_tokens
from data.price import usd_price
from data.protocols import get_protocols_premium, get_protocols_covered, PROTOCOL_META

app = Flask(__name__, template_folder="templates")

def env():
    return {
        "network": settings.NETWORK,
        "chainid": settings.CHAINID,
        "infura": settings.INFURA_TOKEN,
        "pool_address": settings.SHERLOCK_ADDRESS,
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
        data= {
            "pool": pool.get_staking_pool_data(),
            "cooldown_period": settings.SHERLOCK_CONTRACT_HTTP.functions.getCooldown().call(),
            "unstake_window": settings.SHERLOCK_CONTRACT_HTTP.functions.getUnstakeWindow().call()
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
                    "token":entry["token"],
                    "stake":entry["stake"]
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
                    "token":entry["token"],
                    "stake":entry["stake"]
                }
            )
    return "Not supported", 404

@app.route('/breakdown')
def breakdown():
    covered, usd_total = get_protocols_covered()
    return render_template(
        'breakdown.html',
        title='Breakdown',
        desc='breakdown',
        tags=["breakdown"],
        currentPage="breakdown",
        env=env(),
        data= {
            "tokens": get_tokens(),
            "protocols": get_protocols_premium(),
            "protocols_covered": covered,
            "protocol_meta": PROTOCOL_META,
            "usd": usd_price,
            "total_covered_usd": usd_total,
            "total_covered_usd_str": '{:20,.2f}'.format(usd_total / 100000).strip(),
        }
    )

if __name__ == '__main__':
    app.run(host=settings.SERVER_HOST, port=settings.SERVER_PORT)
