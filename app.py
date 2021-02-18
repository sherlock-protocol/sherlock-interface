import settings

from flask import Flask, render_template
app = Flask(__name__, template_folder="templates")

@app.route('/dashboard')
def dashboard():
    return render_template(
        'dashboard.html',
    )

@app.route('/')
def allocations():
    return render_template(
        'allocations.html',
    )


@app.route('/')
def landing():
    return render_template(
        'landing.html',
    )

if __name__ == '__main__':
    app.run(host=settings.SERVER_HOST, port=settings.SERVER_PORT)