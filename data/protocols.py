import copy
from random import randrange

from settings import TOKENS, SHERLOCK_HTTP, BLOCKS_PER_DAY

from data.helper import human_format
from data.price import get_price

from collections import OrderedDict

PRIMITIVE_PROTOCOL = "0x8730a838a5ce28d25f52f8eaafa94b6c96321fcb490e394d6aa46b4b84ed9c85"
TELLER_PROTOCOL = "0x7e964a6811a4c68a414897db01fbdc86548992442bf2c39d7cfe5aa4669a70cc"
EULER_PROTOCOL = "0x58715d22f4870f6849ddc17375d2cfe0145dc6287ec5da28856ebb0be75a24e5"

PROTOCOL_PREMIUMS = {
    PRIMITIVE_PROTOCOL: {},
    TELLER_PROTOCOL: {},
    EULER_PROTOCOL: {},
}

PROTOCOL_META = OrderedDict([
    (PRIMITIVE_PROTOCOL, {
        "name": "Nifty Options by Teller",
        "website": "https://niftyoptions.org/",
        "twitter": "https://twitter.com/NiftyOptionsOrg",
        "agreement": "Nifty_Options_Statement_of_Coverage.pdf",
        "logo": "nifty.png",
        "desc": "Nifty Options is the first on-chain NFT options trading protocol whose contract allows the right to sell a specific NFT at an agreed upon price and expiration date in the future.  Hedge NFTs. Borrow against NFTs. Sell NFT options.",
        "deductable": "5k USDC"
    }),
    (TELLER_PROTOCOL, {
        "name": "Primitive",
        "website": "https://primitive.finance/",
        "twitter": "https://twitter.com/primitivefi",
        "agreement": "",
        "logo": "",
        "desc": "Primitive is a new kind of AMM that can be used for hedging liquidity positions on other AMMs, like Uniswap, as well as to generate returns from volatility on long-tail assets.",
        "deductable": "0"
    }),
    (EULER_PROTOCOL, {
        "name": "Protocol #3",
        "website": "",
        "twitter": "",
        "agreement": "",
        "logo": "",
        "desc": "Announcement coming soon…",
        "deductable": "0",
        "coverage_document": ""
    })
])

PROTOCOL_COVERED = {
    PRIMITIVE_PROTOCOL: {
        "tokens": {
            TOKENS["USDC"]["address"]: {
                "covered": 10000000.0,
            },
        }
    },
    TELLER_PROTOCOL: {
        "tokens": {
            TOKENS["USDC"]["address"]: {
                "covered": 10000000.0,
            },
        }
    },
    EULER_PROTOCOL: {
        "tokens": {
            TOKENS["USDC"]["address"]: {
                "covered": 10000000.0,
            },
        }
    }
}


def get_protocols_covered():
    return {
        "0x8730a838a5ce28d25f52f8eaafa94b6c96321fcb490e394d6aa46b4b84ed9c85": {
            "tokens": {
            "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48": {
                "covered": 1000000000000.0,
                "percentage": 100.0,
                "covered_str": "10M"
            }
            },
            "usd": 1000000000000.0,
            "usd_str": "10,000,000",
            "percentage": 33.33333333333333,
            "percentage_str": "33",
            "sorted": ["0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"]
        },
        "0x7e964a6811a4c68a414897db01fbdc86548992442bf2c39d7cfe5aa4669a70cc": {
            "tokens": {
            "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48": {
                "covered": 1000000000000.0,
                "percentage": 100.0,
                "covered_str": "10M"
            }
            },
            "usd": 1000000000000.0,
            "usd_str": "10,000,000",
            "percentage": 33.33333333333333,
            "percentage_str": "33",
            "sorted": ["0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"]
        },
        "0x58715d22f4870f6849ddc17375d2cfe0145dc6287ec5da28856ebb0be75a24e5": {
            "tokens": {
            "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48": {
                "covered": 1000000000000.0,
                "percentage": 100.0,
                "covered_str": "10M"
            }
            },
            "usd": 1000000000000.0,
            "usd_str": "10,000,000",
            "percentage": 33.33333333333333,
            "percentage_str": "33",
            "sorted": ["0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"]
        }
    }, 3000000000000.0


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
