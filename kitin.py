from flask import Flask, render_template


app = Flask(__name__)


@app.route("/")
def start():
    return render_template('start.html')

@app.route("/monografi.html")
def monografi():
    return render_template('monografi.html')

@app.route('/user/<name>')
def show_user(name=None):
    return render_template('home.html', name=name)


if __name__ == "__main__":
    from sys import argv
    if '-d' in argv:
        app.debug = True
    app.run()
