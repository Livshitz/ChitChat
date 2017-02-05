# ChitChat - https://chitchat-157309.appspot.com
Get random topic, say what's on your mind and see what others say. Your have 1 minute. Go!
<img src="https://cloud.githubusercontent.com/assets/246724/22620744/ff907066-eb1a-11e6-877c-0ac87b221a37.png" width="250" height="250">
This app is intended to be a template for quick-start project for hackathons. 
--------------
# Background
This project was build on order to experiment GAE (Google App Engine), it's serverless platform, and to learn Python.  

This webapp is split into background-service which runs independently, and the frontend-service which only holds the pre-compiled html & js files of the webapp. Both services are auto-scaleable (by GAE) under pressure, each by it's own pressure.  
The frontend is a SPA (Single Page Application) constructed as Jade, and compiled at compile-time into html. So when visitor hits the site, he gets immidiatly the compiled version, no server-side work needed.

# Technologies used
- GAE (as PaaS)
    - Serves and auto-balances the frontend and backend
    - Datastore
    - Task Queues & Deferred (for async and background processing)
- Firebase
    - Auth (Facebook, Google and Anon authentication)
    - Realtime Database (for conversations)
    - Storage (for pictures)
- Python
    - Flask (for backend endpoints)
- Angular (with heavy customization, like lazy-loading views and components)
- Jade (easy and comfort way to build html)
- Gulp (for Jade and LESS compile-on-save)

# Build
## Get python packages:
```
pip install -r /path/to/requirements.txt
```

## Get nodejs packages and start dev environment:
```
npm install
gulp dev
```

## Create local file with Firebase secret key:
This key is used in order to use Firebase's REST API to manipulate the topics.
- Go to: 'https://console.firebase.google.com/project/[YOUR-PROJECT-ID]/settings/serviceaccounts/databasesecrets'
- Grab the 'Secrets' key
- Save it into a file at '[ChitChat folder]/backend/authkey-chitchat.txt'

## Start GAE dev environment:
```
dev_appserver.py frontend/app.yaml backend/app.yaml 
```

