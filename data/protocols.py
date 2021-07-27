import copy
from random import randrange

from settings import TOKENS, SHERLOCK_HTTP, BLOCKS_PER_DAY

from data.helper import human_format
from data.price import get_price

BADGER_PROTOCOL = "0x9ceb4e7d9163b5097134e3510672288d95e50a96ed52a3208ad623d63a3018d7"
ALCHEMIX_PROTOCOL = "0xdd413d9b3b2f5f77677c67d4b2382c0590df319a049f5ab28ed78137a4312537"
SET_PROTOCOL = "0x7ac86e2883eb827a4d72f9dd7e597d09f426ebe1152c1c63092f81a9a6f73803"

PROTOCOL_PREMIUMS = {
    BADGER_PROTOCOL: {},
    ALCHEMIX_PROTOCOL: {},
    SET_PROTOCOL: {},
}

PROTOCOL_META = {
    ALCHEMIX_PROTOCOL: {
        "name": "AlchemIX",
        "website": "https://alchemix.fi/",
        "twitter": "https://twitter.com/alchemixfi",
        "logo": "alchmix",
        "desc": "Alchemix is a DeFi protocol that allows for the creation of synthetic tokens that represent the future yield of a deposit. It enables users to retrieve near instant tokenized value against temporary* deposits of stablecoins. A magic money potion if you will, however one that is crafted in Defi with perhaps a sprinkling of ancient wisdom(!). The protocol presents a powerful new DeFi primitive offering myriad applications for users and an exciting new tool for other developers.",
        "deductable": "123,00",
        "lead_watson": "Evert0x",
    },
    BADGER_PROTOCOL: {
        "name": "Badger",
        "website": "https://badger.finance/",
        "twitter": "https://twitter.com/BadgerDAO",
        "logo": "badger",
        "desc": "Badger is a decentralized autonomous organization (DAO) with a single purpose: build the products and infrastructure necessary to accelerate Bitcoin as collateral across other blockchains.",
        "deductable": "123,00",
        "lead_watson": {
            "name": "flessendop",
            "twitter": "flessendop",
            "risk_analysus": "badger_risk_analysis.pdf",
        },
    },
    SET_PROTOCOL: {
        "name": "SET Protocol",
        "website": "https://www.tokensets.com/",
        "twitter": "https://twitter.com/SetProtocol",
        "logo": "setprotocol",
        "desc": "Set Protocol is a non-custodial protocol built on Ethereum that allows for the creation, management, and trading of Sets, ERC20 tokens that represent a portfolio or basket of underlying assets. Each Set operates and periodically rebalances its portfolio according to a strategy coded into its smart contract.",
        "deductable": "123,00",
        "coverage_document": "", 
        "lead_watson": {
            "name": "JackSanford",
            "twitter": "jack",
            "risk_analysus": "set-protocol_risk_analysis.pdf",
        },
    },
}

PROTOCOL_COVERED = {
    ALCHEMIX_PROTOCOL: {
        "tokens": {
            TOKENS["DAI"]["address"]: {
                "covered": 500000.0,
            }
        }
    },
    BADGER_PROTOCOL: {
        "tokens": {
            TOKENS["WBTC"]["address"]: {
                "covered": 2500.0,
            },
        }
    },
    SET_PROTOCOL: {
        "tokens": {
            TOKENS["DAI"]["address"]: {
                "covered": 100000.0,
            },
            TOKENS["USDC"]["address"]: {
                "covered": 100000.0,
            },
            TOKENS["WETH"]["address"]: {
                "covered": 100000.0,
            },
            TOKENS["WBTC"]["address"]: {
                "covered": 2500.0,
            },
            TOKENS["AAVE"]["address"]: {
                "covered": 100000.0,
            },
            TOKENS["SUSHI"]["address"]: {
                "covered": 100000.0,
            }
        }
    }
}


def get_protocols_covered():
    protocols_covered = copy.deepcopy(PROTOCOL_COVERED)

    total_covered_usd = 0
    for k, v in protocols_covered.items():
        usd = 0
        for token, c in v["tokens"].items():
            p = get_price(token) * c["covered"]
            usd += p

            c["covered"] = p
            c["covered_str"] = human_format(p / 100000)
            # TODO: @Evert could you calculate the percentage of the total here?
            c["percentage"] = randrange(100)

        total_covered_usd += usd
        protocols_covered[k]["usd"] = usd
        protocols_covered[k]["usd_str"] = '{:20,.0f}'.format(
            usd / 100000).strip()

    for k, v in protocols_covered.items():
        protocols_covered[k]["percentage"] = protocols_covered[k]["usd"] / \
            total_covered_usd * 100

        protocols_covered[k]["percentage_str"] = "%.0f" % round(
            float(protocols_covered[k]["percentage"]), 2)

        protocols_covered[k]["sorted"] = (
            sorted(v["tokens"], key=lambda i: v["tokens"]
                   [i]["covered"], reverse=True)
        )

    return protocols_covered, total_covered_usd


def _get_protocol_premium(symbol, data, protocol_id):
    premium = SHERLOCK_HTTP.functions.getProtocolPremium(
        protocol_id, data["address"]).call()

    premium_per_day = premium * BLOCKS_PER_DAY

    premium_per_day_format = round(float(premium_per_day) / data["divider"], 3)
    premium_per_day_format_str = "%.2f" % premium_per_day_format
    if premium_per_day_format < 0.001:
        premium_per_day_format_str = "<0.001"

    return {
        "premium": premium_per_day_format,
        "premium_str": premium_per_day_format_str
    }


def get_protocols_premium():
    protocol_premiums = copy.deepcopy(PROTOCOL_PREMIUMS)

    for symbol, data in TOKENS.items():
        protocols = SHERLOCK_HTTP.functions.getProtocols(
            data["address"]).call()
        for protocol_id in protocols:
            protocol_id = "0x"+protocol_id.hex()

            premium_data = _get_protocol_premium(symbol, data, protocol_id)
            protocol_premiums[protocol_id][data["address"]] = premium_data

    return protocol_premiums
