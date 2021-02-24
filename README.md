Python 3 needs to be installed together with virtualenv.

Use `python3 --version` to check if python3 is installed

`python3 -m virtualenv venv` to create a virtual env.

`source venv/bin/activate` to active the environment

`pip install -r requirements.txt` to install dependencies

Put the following data in `.env` file
```
NETWORK=KOVAN
CHAINID=42
INFURA_TOKEN=
```

Run `python app.py` (inside you virtualenv) to start the web server.