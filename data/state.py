from settings import INFURA_HTTP

def get_state():
    block = INFURA_HTTP.eth.get_block("latest")
    return {
        "block": block.number,
        "timestamp": block.timestamp
    }