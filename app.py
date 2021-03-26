import settings
from web3 import Web3

from data import pool
from flask import Flask, render_template, request

app = Flask(__name__, template_folder="templates")

def env():
    return {
        "network": settings.NETWORK,
        "chainid": settings.CHAINID,
        "infura": settings.INFURA_TOKEN,
        "pool_address": settings.POOL_ADDRESS,
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
            "claimperiod": settings.POOL_CONTRACT_HTTP.functions.getClaimPeriod().call(),
            "timperiod": settings.POOL_CONTRACT_HTTP.functions.getTimeLock().call()
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

@app.route('/allocations')
def allocations():
    return render_template(
        'allocations.html',
        title='Allocations',
        desc='allocations',
        tags=["allocations"],
        currentPage="allocations",
        env=env(),
        data={"protocols": pool.get_covered_protocols()}
    )


@app.route('/faq')
def faq():
    return render_template(
        'faq.html',
        title='FAQ',
        desc='faq',
        tags=["faq"],
        currentPage="faq",
        env=env(),
        data={}
    )


if __name__ == '__main__':
    # print(pool.get_staking_pool_data())
    # print(pool.get_covered_protocols())
    # print(pool.get_pool_strategies())
    app.run(host=settings.SERVER_HOST, port=settings.SERVER_PORT)
