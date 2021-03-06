import worker
import os
import datetime

from web3 import Web3
from flask import Flask, render_template, request, redirect, send_from_directory, abort

import settings
from data.cache import pool, tokens, price, protocols, sherlock, sherx, state

app = Flask(__name__, template_folder="templates")


@app.route('/favicon.png')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'),
                               'favicon.png', mimetype='image/png')

@app.errorhandler(404)
def page_not_found(e):
    return render_template('http-error.html',
        env=env(),
        data={
            "error": "404 - Page not found",
            "status": "404"
        }
    ), 404

@app.errorhandler(500)
def page_not_found(e):
    return render_template('http-error.html',
        env=env(),
        data={
            "error": "500 - Internal server error",
            "status": "500"
        }
    ), 500

def env():
    return {
        "network": settings.NETWORK,
        "chainid": settings.CHAINID,
        "infura": settings.INFURA_TOKEN,
        "pool_address": settings.SHERLOCK,
        "git_hash": settings.GIT_HASH,
        "docsBaseUrl": settings.DOCS_BASEURL,
        "wallet": request.cookies.get('wallet', 'None'),
        "endpoint": settings.ENDPOINT,
        "state": state.get_state(),
        "blocktime": 13325
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
            "sherx": sherx.get_underlying(),
            "pool": pool.get_staking_pool_data(),
            "cooldown_period": sherlock.get_cooldown_period(),
            "unstake_window":  sherlock.get_unstake_window(),
            "network": settings.NETWORK
        }
    )

@app.route('/stake/<address>')
def deposit(address):
    e = env()
    if e["wallet"] == "None":
        return redirect("/", code=302)

    address = Web3.toChecksumAddress(address)
    for entry in pool.get_staking_pool_data()["tokens"]:
        if address == entry["token"]["address"]:
            return render_template(
                'deposit.html',
                title='Deposit',
                desc='deposit',
                tags=["deposit"],
                currentPage="deposit",
                env=e,
                data={
                    "token": entry["token"],
                    "stake": entry["stake"],
                    "xrate": entry["xrate"],
                    "xrate_str": entry["xrate_str"],
                    "usd": price.get_prices()[entry["token"]["address"]]
                }
            )
    return "Not supported", 404


@app.route('/cooldown/<address>')
def withdraw(address):
    e = env()
    if e["wallet"] == "None":
        return redirect("/", code=302)

    address = Web3.toChecksumAddress(address)
    for entry in pool.get_staking_pool_data()["tokens"]:
        if address == entry["token"]["address"]:
            return render_template(
                'withdraw.html',
                title='Withdraw',
                desc='withdraw',
                tags=["withdraw"],
                currentPage="withdraw",
                env=e,
                data={
                    "token": entry["token"],
                    "stake": entry["stake"],
                    "xrate": entry["xrate"],
                    "xrate_str": entry["xrate_str"],
                    "usd": price.get_prices()[entry["token"]["address"]]
                }
            )
    return "Not supported", 404


@app.route('/harvest/<address>')
def harvest(address):
    e = env()
    if e["wallet"] == "None":
        return redirect("/", code=302)

    address = Web3.toChecksumAddress(address)
    for entry in pool.get_staking_pool_data()["tokens"]:
        if address == entry["token"]["address"]:
            return render_template(
                'harvest.html',
                title='Harvest',
                desc='harvest',
                tags=["harvest"],
                currentPage="harvest",
                env=e,
                data={
                    "token": entry["token"],
                    "stake": entry["stake"],
                    "xrate": entry["xrate"],
                    "xrate_str": entry["xrate_str"],
                    "usd": price.get_prices()[entry["token"]["address"]]
                }
            )
    return "Not supported", 404


@app.route('/breakdown')
def breakdown():
    covered, usd_total = protocols.get_protocols_covered()
    usd_total_format = '{:20,.0f}'.format(usd_total / 100000).strip()
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
            "usd": price.get_prices(),
            "total_covered_usd": usd_total,
            "total_covered_usd_str": usd_total_format
        }
    )

if __name__ == '__main__':
    if os.environ.get("FLASK_ENV") == "development":
        import threading
        x = threading.Thread(target=worker.loop, args=())
        x.start()

    app.run(host=settings.SERVER_HOST, port=settings.SERVER_PORT)
