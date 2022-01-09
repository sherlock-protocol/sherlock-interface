import copy
from random import randrange

from settings import TOKENS, SHERLOCK_HTTP, BLOCKS_PER_DAY

from data.helper import human_format
from data.price import get_price

from collections import OrderedDict

PRIMITIVE_PROTOCOL = "0x8730a838a5ce28d25f52f8eaafa94b6c96321fcb490e394d6aa46b4b84ed9c85"
TELLER_PROTOCOL = "0x7e964a6811a4c68a414897db01fbdc86548992442bf2c39d7cfe5aa4669a70cc"
EULER_PROTOCOL = "0x58715d22f4870f6849ddc17375d2cfe0145dc6287ec5da28856ebb0be75a24e5"
SQUEETH_PROTOCOL = "0x38efa46790306cfd13d0cc13126282eaeaa59b806fd0b2853aa8a49876f37234"

PROTOCOL_PREMIUMS = {
    SQUEETH_PROTOCOL: {},
    EULER_PROTOCOL: {},
    PRIMITIVE_PROTOCOL: {},
    TELLER_PROTOCOL: {},
}

PROTOCOL_META = OrderedDict([
    (SQUEETH_PROTOCOL, {
        "name": "Squeeth by Opyn",
        "website": "https://www.opyn.co/",
        "twitter": "https://twitter.com/opyn_",
        "agreement": "",
        "logo": "",
        "desc": "Squeeth (squared ETH) is a Power Perpetual that tracks the price of ETH². This functions similar to a perpetual swap where you are targeting ETH² rather than ETH. Long Squeeth gives traders a leveraged position with unlimited ETH² upside, protected downside, and no liquidations. Squeeth buyers pay a funding rate for this position. In contrast, short Squeeth is a short ETH² position, collateralized with ETH. Traders earn a funding rate for taking on this position, paid by long Squeeth holders.",
        "deductable": "0",
    }),
    (EULER_PROTOCOL, {
        "name": "Euler",
        "website": "https://www.euler.finance/",
        "twitter": "https://twitter.com/eulerfinance",
        "agreement": "Euler Statement of Coverage 12.14.21.pdf",
        "logo": "",
        "desc": "Euler is a non-custodial protocol on Ethereum that allows users to lend and borrow almost any crypto asset.",
        "deductable": "0",
    }),
    (PRIMITIVE_PROTOCOL, {
        "name": "Primitive",
        "website": "https://primitive.finance/",
        "twitter": "https://twitter.com/primitivefi",
        "agreement": "Primitive Statement of Coverage 12.14.21.pdf",
        "logo": "",
        "desc": "Primitive is a new kind of AMM that can be used for hedging liquidity positions on other AMMs, like Uniswap, as well as to generate returns from volatility on long-tail assets.",
        "deductable": "0"
    }),
    (TELLER_PROTOCOL, {
        "name": "Nifty Options by Teller",
        "website": "https://niftyoptions.org/",
        "twitter": "https://twitter.com/NiftyOptionsOrg",
        "agreement": "Nifty_Options_Statement_of_Coverage.pdf",
        "logo": "nifty.png",
        "desc": "Nifty Options is the first on-chain NFT options trading protocol whose contract allows the right to sell a specific NFT at an agreed upon price and expiration date in the future.  Hedge NFTs. Borrow against NFTs. Sell NFT options.",
        "deductable": "5k USDC"
    }),
])

PROTOCOL_COVERED = {
    SQUEETH_PROTOCOL: {
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
    },
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
    }
}


def get_protocols_covered():
    return {
        "0x38efa46790306cfd13d0cc13126282eaeaa59b806fd0b2853aa8a49876f37234": {
            "tokens": {
            "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48": {
                "covered": 1000000000000.0,
                "percentage": 100.0,
                "covered_str": "10M"
            }
            },
            "usd": 1000000000000.0,
            "usd_str": "10,000,000",
            "percentage": 25.00,
            "percentage_str": "25",
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
            "percentage": 25.00,
            "percentage_str": "25",
            "sorted": ["0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"]
        },
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
            "percentage": 25.00,
            "percentage_str": "25",
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
            "percentage": 25.00,
            "percentage_str": "25",
            "sorted": ["0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"]
        }
    }, 4000000000000.0


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
