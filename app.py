import settings
from data import pool
from flask import Flask, render_template, request

app = Flask(__name__, template_folder="templates")

def env():
    return {
        "network": settings.NETWORK,
        "chainid": settings.CHAINID,
        "infura": settings.INFURA_TOKEN,
        "pool_address": settings.POOL_ADDRESS
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
        data={
            "faq": [
                {
                    "q": "How does it work?",
                    "a": "Audits R Dead is an insurance platform designed to provide protocols with affordable, high-quality coverage against smart contract hacks. Anyone can stake in our insurance pool and we aim to offer the highest risk-adjusted return in DeFi. This is made possible by our expert smart contract security team, who reviews and prices insurance for every protocol we cover and has “skin-in-the-game” alongside our stakers."
                },
                {
                    "q": "How is it different from other insurance protocols?",
                    "a": "We think existing insurance is unpopular for two major reasons: 1) Poor user experience and 2) high prices. 1) Nobody likes buying insurance which is why we don’t make you do it. We cover protocols wholesale so users don’t need to worry about it. 2) Existing protocols outsource pricing by either making users decide which protocols are safe or by relying on old audits. We have a team of expert smart contract security analysts who price our insurance and have “skin in the game” alongside our stakers."
                },
                {
                    "q": "Why are audits dead?",
                    "a": "A major reason many protocols pay for expensive audits is to prevent user funds from being stolen. Over the last few months, it has become increasingly clear that audits are not a perfect solution for preventing hacks. We don’t think there is a perfect solution to preventing hacks. Instead, we think the risk of loss should be shifted from unsuspecting users to investors who are looking for a favorable risk-adjusted return. That’s why we built this protocol."
                },
                {
                    "q": "How does staking work?",
                    "a": "Stakers put their funds in our pool and receive a yield based on protocol insurance fees and current lending protocol rates. These funds cover the risk of smart contract hacks among our partner protocols and can be slashed in the event of a hack. There is currently a 3-day “unlocking” period to withdraw funds from the pool."
                },
                {
                    "q": "How can I get insurance as a protocol?",
                    "a": "We are currently in a closed beta with a select number of protocols. Please email us at auditsrdead@gmail.com to join the waitlist."
                },
                {
                    "q": "How do I start using it on Kovan?",
                    "a": "Get Kovan ETH here. </br>Get Kovan Aave Dai here."
                },
                {
                    "q": "Where can I see the contracts this protocol interacts with?",
                    "a": ""
                }
            ]
        },
        wallet=request.cookies.get('wallet'),
        env=env()
    )


if __name__ == '__main__':
    # print(pool.get_staking_pool_data())
    # print(pool.get_covered_protocols())
    # print(pool.get_pool_strategies())
    app.run(host=settings.SERVER_HOST, port=settings.SERVER_PORT)
