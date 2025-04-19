from bottle import route, run, template


@route("/")
def hello_world():
    return "Hello, World! To specify a name use /hello/<name> with your desired name. For example, /hello/John"


@route("/hello/<name>")
def index(name):
    return template("<b>Hello {{name}}</b>!", name=name)


run(host="0.0.0.0", port=8080)
