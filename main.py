from cffi.backend_ctypes import unicode
from flask import Flask, render_template, request
import hashlib
import json
import requests
import time

app = Flask(__name__)

login = 'wish'
ts = unicode(time.time())
api_key = 'etqiJGoBqPoNWsJtELHUBLlg'
secret = hashlib.md5((ts + api_key).encode()).hexdigest()

def generate_code():
    """Генерация случайного кода заданной длины."""
    import random
    return ''.join(random.choice('0123456789') for i in range(4))

headers = {
    'login': login,
    'ts': ts,
    'secret': secret,
    'Content-type': 'application/json',
}
data = {
    'route': 'fcall',
    'to': '+79993332211',
    'text': generate_code()
}

def send_sms_code():
    """Отправка SMS-кода для авторизации."""
    r = requests.post('https://cp.redsms.ru/api/message', headers=headers, data=json.dumps(data))

    if r.status_code == 200:
        return True
    else:
        return False

@app.route("/")
def index():
    """Первая страница с вводом номера телефона."""
    return render_template("index.html")

@app.route("/verify", methods=["POST"])
def verify():
    """Обработка формы с вводом номера телефона."""
    phone_number = request.form["phone_number"]
    data['to'] = phone_number
    recieve = send_sms_code()
    if recieve:
        return render_template("verify.html", code=recieve, phone_number=phone_number)
    else:
        return "Error"

@app.route("/confirm", methods=["POST"])
def confirm():
    """Обработка формы с вводом кода подтверждения."""
    phone_number = request.form["phone_number"]
    entered_code = request.form["code"]

    if entered_code==data['text']:
        is_verified=True
    else:
        is_verified=False

    if is_verified:
        # Авторизация прошла успешно
        return "Авторизация прошла успешно!"
    else:
        return "Неверный код подтверждения"


if __name__ == "__main__":
    app.run()
