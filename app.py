import settings

from flask import Flask, render_template
app = Flask(__name__, template_folder="templates")

@app.route('/dashboard')
def dashboard():
    return render_template(
        'dashboard.html',
        title='Dashboard',
        desc='dashboard',
        tags=["dashboard"],
        currentPage="dashboard",
    )

@app.route('/allocations')
def allocations():
    return render_template(
        'allocations.html',
        title='Allocations',
        desc='allocations',
        tags=["allocations"],
        currentPage="allocations",
    )


@app.route('/')
def landing():
    return render_template(
        'landing.html',
        title='Landing',
        desc='landing',
        tags=["landing"],
        currentPage="landing",
    )

if __name__ == '__main__':
    app.run(host=settings.SERVER_HOST, port=settings.SERVER_PORT)