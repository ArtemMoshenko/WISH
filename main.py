import os
import pyrebase
from flask import Flask, render_template, request

config={
    'apiKey': os.environ['FIREBASE_API_KEY'],
    'authDomain': "wish-1a863.firebaseapp.com",
    'projectId': "wish-1a863",
    'storageBucket': "wish-1a863.appspot.com",
    'messagingSenderId': "876599678293",
    'appId': "1:876599678293:web:6b15d4438ee75739bc8bdc",
    'measurementId': "G-NXXWC0HMCV",
    "databaseURL": ""
}

firebase = pyrebase.initialize_app(config)
auth = firebase.auth()

app = Flask(__name__)

@app.route('/')
@app.route('/index',methods=['GET','POST'])
def index():
    if request.method=='POST':
        email=request.form['user_email']
        password= request.form['user_pas']
        try:
            auth.sign_in_with_email_and_password(email,password)
            user_info=auth.sign_in_with_email_and_password(email,password)
            account_info=auth.get_account_info(user_info['idToken'])
            if account_info["users"][0]["emailVerified"]== False:
                verify_message = 'Please verify your email'
                return render_template('index.html',umessage=verify_message)
            return render_template('home.html')
        except:
            unsuccessful= 'Please check your credentials'
            return render_template('index.html',umessage=unsuccessful)
    return render_template('index.html')

@app.route('/create_account',methods =['GET','POST'])
def create_account():
    if request.method == 'POST':
        pas0=request.form['user_pas0']
        pas1=request.form['user_pas1']
        if pas1==pas0:
            try:
                email=request.form['user_email']
                password=request.form['user_pas0']
                new_user= auth.create_user_with_email_and_password(email,password)
                auth.send_email_verification(new_user['idToken'])
                return render_template('verify_email.html')
            except:
                existing_account='This email is already used'
                return render_template('create_account.html',exist_message=existing_account)

    return render_template('create_account.html')

@app.route('/reset_password',methods =['GET','POST'])
def forgot_password():
    if request.method=='POST':
        email=request.form['user_email']
        auth.send_password_reset_email(email)
        return render_template('index.html')
    return render_template('reset_password.html')

if __name__ == "__main__":
    app.run()
