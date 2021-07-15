from settings import INFURA_HTTP, TIMESTAMP_ERROR

def get_state():
    block = INFURA_HTTP.eth.get_block("latest")
    return {
        "block": block.number,
        "timestamp": block.timestamp + TIMESTAMP_ERROR
    }