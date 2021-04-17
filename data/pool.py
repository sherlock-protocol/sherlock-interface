import settings
from web3 import Web3
from datetime import datetime, timedelta

blocks_per_day = 6484
blocks_per_year = blocks_per_day * 365

usd_price = {
    '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853': 1.00 * 100000,
    '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6': 1.01 * 100000,
    '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318': 400.00 * 100000,
    '0x610178dA211FEF7D417bC0e6FeD39F05609AD788': 1500.00 * 100000
}

protocol_meta = {
    "561ca898cce9f021c15a441ef41899706e923541cee724530075d1a1144761c1": {
        "name": "AlchemIX",
        "website": "https://alchemix.fi/",
        "twitter": "https://twitter.com/alchemixfi",
        "logo": "alchmix",
        "desc": "Alchemix is a DeFi protocol that allows for the creation of synthetic tokens that represent the future yield of a deposit. It enables users to retrieve near instant tokenized value against temporary* deposits of stablecoins. A magic money potion if you will, however one that is crafted in Defi with perhaps a sprinkling of ancient wisdom(!). The protocol presents a powerful new DeFi primitive offering myriad applications for users and an exciting new tool for other developers.",
    },
    "561ca898cce9f021c15a441ef41899706e923541cee724530075d1a1144761c2": {
        "name": "Badger",
        "website": "https://badger.finance/",
        "twitter": "https://twitter.com/BadgerDAO",
        "logo": "badger",
        "desc": "Badger is a decentralized autonomous organization (DAO) with a single purpose: build the products and infrastructure necessary to accelerate Bitcoin as collateral across other blockchains.",
    },
    "561ca898cce9f021c15a441ef41899706e923541cee724530075d1a1144761c3": {
        "name": "SET Protocol",
        "website": "https://www.tokensets.com/",
        "twitter": "https://twitter.com/SetProtocol",
        "logo": "setprotocol",
        "desc": "The asset management protocol.",
    },
}

def get_staking_pool_data():
    total = 0
    total_numba = 0
    tokens = []

    poolTokens = settings.POOL_CONTRACT_HTTP.functions.getTokens().call()
    for token in poolTokens:
        stake = settings.POOL_CONTRACT_HTTP.functions.getStakeToken(token).call()

        TOKEN = settings.INFURA_HTTP.eth.contract(address=token, abi=settings.ERC20_ABI)
        token_decimals = TOKEN.functions.decimals().call()
        divider = float("1" + "0" * token_decimals)
        STAKE = settings.INFURA_HTTP.eth.contract(address=stake, abi=settings.ERC20_ABI)

        tvl = settings.POOL_CONTRACT_HTTP.functions.getStakersTVL(token).call()
        tvl_usd = tvl / divider * usd_price[token]
        total += tvl_usd

        premium_per_block = settings.POOL_CONTRACT_HTTP.functions.getTotalPremiumPerBlock(token).call()
        premium_per_50ms = int(premium_per_block / 260) # 1 block = 13 seconds. So 260 of these increments per block
        premium_per_50ms_usd = premium_per_50ms / divider * usd_price[token]
        total_numba += premium_per_50ms_usd

        premium_per_year = premium_per_block * blocks_per_year
        if tvl == 0:
            apy = str(99999999.99)
        else:
            apy = "%.2f" % round(float(premium_per_year) / tvl, 2)

        tokens.append({
            "token": {
                "address": token,
                "name": TOKEN.functions.name().call(),
                "symbol": TOKEN.functions.symbol().call(),
                "decimals": token_decimals,
            },
            "stake":{
                "address": stake,
                "name": STAKE.functions.name().call(),
                "symbol": STAKE.functions.symbol().call(),
                "decimals": STAKE.functions.decimals().call(),
            },
            "pool": {
                "size": tvl,
                "size_str": str(tvl),
                "size_format": "%.2f" % round(tvl / divider, 2),
                "numba": premium_per_50ms,
                "numba_str": str(premium_per_50ms),
                "usd_size": tvl_usd,
                "usd_size_str": "%.2f" % round(tvl_usd, 2),
                "usd_numba": premium_per_50ms_usd,
                "usd_numba_str": str(premium_per_50ms_usd),
                #"usd_numba_format": "%.2f" % round(premium_per_50ms_usd, 2),
                "apy": apy
            },
        })

    fee_token = [
        {
            "token": {
                "address": "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853",
                "name": "DAI token",
                "symbol": "dai",
                "decimals": 6
            },
            "percentage": 60.58
        },
        {
            "token": {
                "address": "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6",
                "name": "USD coin",
                "symbol": "usdc",
                "decimals": 8
            },
            "percentage": 10.32
        },
        {
            "token": {
                "address": "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318",
                "name": "AAVE governance",
                "symbol": "aave",
                "decimals": 18
            },
            "percentage": 29.10,
        }
    ]

    #"history":
    history = []

    d = datetime.utcnow().replace(hour=0, minute=0, second=0)
    for i in range(24):
        if i < 10:
            count = 2.32 - i * 0.06
        else:
            count = 1.50 + i * 0.11

        history.append(
            {
                "datetime": (d + timedelta(hours=i)).strftime("%m-%d-%Y, %H:%M"),
                "count": round(count, 2)
            }
        )

    return {
        "tokens": tokens,
        "total": total,
        "usd_total_str": str(total),
        "usd_total_format": "%.2f" % round(total, 2),
        "usd_total_numba": total_numba,
        "usd_total_numba_str": str(total_numba),
        "usd_values": usd_price,
        "fee_token": fee_token,
        "fee_token_history": history
       # "usd_total_numba_format":  "%.2f" % round(total_numba, 2),
    }

def get_covered_protocols():
    poolTokens = settings.POOL_CONTRACT_HTTP.functions.getTokens().call()
    prtc = {}
    tokens = {}

    for token in poolTokens:
        TOKEN = settings.INFURA_HTTP.eth.contract(address=token, abi=settings.ERC20_ABI)
        token_decimals = TOKEN.functions.decimals().call()
        tokens[token] = {
            "name": TOKEN.functions.name().call(),
            "symbol": TOKEN.functions.symbol().call(),
            "decimals": token_decimals,
        }
        protocols = settings.POOL_CONTRACT_HTTP.functions.getProtocols(token).call()
        for p in protocols:
            p = p.hex()
            c = prtc.get(p, {})

            divider = float("1" + "0" * token_decimals)
            #balance = settings.POOL_CONTRACT_HTTP.functions.getProtocolBalance(p, token).call()
            premium = settings.POOL_CONTRACT_HTTP.functions.getProtocolPremium(p, token).call()
            premium_per_day = premium * blocks_per_day

            premium_per_day_format = round(float(premium_per_day) / divider, 3)
            #debt = settings.POOL_CONTRACT_HTTP.functions.getAccruedDebt(p, token).call()
            premium_per_day_format_str = "%.2f" % premium_per_day_format
            if premium_per_day_format < 0.001:
                premium_per_day_format_str = "<0.001"
            c[token] = {
                #"balance": balance,
                #"balance_str": str(balance),
                "premium": premium_per_day_format,
                "premium_str": premium_per_day_format_str,
                #"debt": debt,
                #"debt_str": str(debt)
            }
            prtc[p] = c
    data = {
        "tokens": tokens,
        "protocols": prtc,
        "protocol_meta": protocol_meta,
        "usd": usd_price
    }
    return data

def get_pool_strategies():
    #   return [{'name': 'ATokenV2StrategyToAave', 'token_address': '0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD', 'strategy_address': '0x5852A4a9687dAFFCd5464a2790d3F4d5E5001A69', 'oracle_address': '0x0000000000000000000000000000000000000000', 'balance': "14121785424705346597586066"}, {'name': 'AaveStrategyToUniswap', 'token_address': '0x85821C543d5773cA19b91F5b37e39FeC308C6FA7', 'strategy_address': '0xBb8974C5F93ED2935E4E0d9abC95551310c48F62', 'oracle_address': '0xb3Ef934755f162e2Aa1c7Aae4CD6167aE2694d25', 'balance': "182203692109052093154252"}]
    data = []
    return data

