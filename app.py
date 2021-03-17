import settings
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
    token, tvl = pool.get_staking_pool_data()
    return render_template(
        'dashboard.html',
        title='Dashboard',
        desc='dashboard',
        tags=["dashboard"],
        currentPage="dashboard",
        env=env(),
        data= {
            "tokens": token,
            "tvl": tvl,
            "claimperiod": settings.POOL_CONTRACT_HTTP.functions.getClaimPeriod().call(),
            "timperiod": settings.POOL_CONTRACT_HTTP.functions.getTimeLock().call()
        }
    )

@app.route('/allocations')
def allocations():
    return render_template(
        'allocations.html',
        title='Allocations',
        desc='allocations',
        tags=["allocations"],
        currentPage="allocations",
        env=env(),
        data={ }
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
    # print(pool.get_tokens())
    app.run(host=settings.SERVER_HOST, port=settings.SERVER_PORT)
