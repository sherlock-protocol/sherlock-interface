from decouple import config
import os

SERVER_HOST = config('SERVER_HOST', default="localhost")
SERVER_PORT = config('SERVER_PORT', default=5000)