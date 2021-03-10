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
        "stake_token": "0x2610c11ab6f7dca1d8915f328c6995e0c16f5d94",
        "tokens": pool.get_tokens()
    }

@app.route('/')
def dashboard():
    return render_template(
        'dashboard.html',
        title='Dashboard',
        desc='dashboard',
        tags=["dashboard"],
        currentPage="dashboard",
        data=pool.get_staking_pool_data(),
        wallet=request.cookies.get('wallet'),
        env=env()
    )

@app.route('/allocations')
def allocations():
    return render_template(
        'allocations.html',
        title='Allocations',
        desc='allocations',
        tags=["allocations"],
        currentPage="allocations",
        data={
            "covered_protocols": pool.get_covered_protocols(),
            "pool_strategies": pool.get_pool_strategies(),
            "total_covered_protocols": 12,
            "total_pool_strategies": 1.1e+25
        },
        wallet=request.cookies.get('wallet'),
        env=env()
    )


@app.route('/faq')
def faq():
    return render_template(
        'faq.html',
        title='FAQ',
        desc='faq',
        tags=["faq"],
        currentPage="faq",
        data={},
        wallet=request.cookies.get('wallet'),
        env=env()
    )


if __name__ == '__main__':
    # print(pool.get_staking_pool_data())
    # print(pool.get_covered_protocols())
    # print(pool.get_pool_strategies())
    app.run(host=settings.SERVER_HOST, port=settings.SERVER_PORT)
