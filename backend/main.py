import os

import operator
#import webapp2
import sys
#import werkzeug
from collections import defaultdict
#from json import *
#from google.appengine.ext import ndb
from google.appengine.ext import deferred
#from google.appengine.api import taskqueue
import entities
from flask import Flask, jsonify, config
from flask_cors import CORS, cross_origin
from flask import request
from flask import Response
import random
import datetime
from logging.handlers import RotatingFileHandler
import logging
from werkzeug.exceptions import HTTPException

import infra.helpers
from infra.helpers import *
#from itertools import groupby
#from operator import itemgetter

app = Flask(__name__)
CORS(app)

def configure_app(app):
    config_name = os.getenv('FLASK_CONFIGURATION', 'default')
    app.config.from_object(config[config_name])
    app.config.from_pyfile('config.cfg', silent=True)
    # Configure logging
    handler = logging.FileHandler(app.config['LOGGING_LOCATION'])
    handler.setLevel(app.config['LOGGING_LEVEL'])
    formatter = logging.Formatter(app.config['LOGGING_FORMAT'])
    handler.setFormatter(formatter)
    app.logger.addHandler(handler)

if __name__ == "__main__":
    # initialize the log handler
    logHandler = RotatingFileHandler('info.log', maxBytes=1000, backupCount=1)
    # set the log handler level
    logHandler.setLevel(logging.INFO)
    # set the app logger level
    app.logger.setLevel(logging.INFO)
    app.logger.addHandler(logHandler)

    #configure_app()

    app.run()

def do_something_expensive(a):
    try:
        print(" ---- hey")
        counter = entities.Counter.get_or_insert(entities.Counter.COUNTER_KEY, count=0)
        counter.count += a
        counter.put()
        x = 1
        y = 0
        z =x/y
    except:
        e = sys.exc_info()[0]
        print("\t[!] ERROR: %s" % e)
        #raise

@app.route("/", methods=["GET","POST"])
def MainHandler():
    deferred.defer(do_something_expensive, 1)
    counter = entities.Counter.get_or_insert(entities.Counter.COUNTER_KEY, count=0)
    return 'Hello world! {} {} '.format(infra.helpers.mytest2(), counter.count)

@app.route("/login", methods=["POST"])
def LoginHandler():
    print 'Login-Post-Body:'
    json = request.data
    print json
    obj = Payload(json)
    print obj.fullName

    participant = entities.Participant.get_or_insert(obj.uuid, fullName='')
    participant.fullName = obj.fullName
    participant.uuid = obj.uuid
    key = participant.put()

    us = infra.helpers.UserSession(key.id(), '')
    token = us.getEncrypted()

    # us2 = infra.test.UserSession.decrypt(token)

    return token

@app.route("/test")
def TestHandler():
    token = (request.args.get('token') or '').encode("utf-8")

    resp = Response("")
    if (token != None and token != ''):
        userSession = infra.helpers.UserSession.decrypt(token)
        resp.set_data( userSession.userId )
    else:
        resp.set_data("OK!")
    resp.headers['Access-Control-Allow-Origin'] = '*'

    return resp;

@app.route("/getUser")
def GetUserHandler():
    token = (request.args.get('token') or '').encode("utf-8")
    userSession = infra.helpers.UserSession.decrypt(token)

    participant = entities.Participant.get_or_insert(userSession.userId)

    res = Response(json.dumps(participant.to_dict()))
    res.headers['Content-Type'] = 'application/json'
    return res

def _getRandomTopics():
    topicsContainer = entities.TopicsContainer.get_or_insert(entities.TopicsContainer.DEFAULT_KEY)

    # entities.TopicsContainer.query(ancestor=entities.TopicsContainer.DEFAULT_KEY)

    topics = topicsContainer.topics[:1000]
    random.shuffle(topics)
    return topics

@app.route("/getTopics")
def GetTopics():
    topics = _getRandomTopics()

    res = Response(json.dumps(topics))
    res.headers['Content-Type'] = 'application/json'
    return res

@app.route("/addTopic/<topicName>")
def AddTopic(topicName):
    topicsContainer = entities.TopicsContainer.get_or_insert(entities.TopicsContainer.DEFAULT_KEY)

    if topicName not in topicsContainer.topics:
        topicsContainer.topics.append(topicName)
        topicsContainer.put()

    return GetTopics()

@app.route("/updateActivity/<userid>/<topic>", methods=["POST"])
def UpdateActivity(userid, topic):
    json = request.data
    obj = Payload(json)

    deferred.defer(updateActivityLater, userid, topic, obj.displayName)

    res = Response('ok')
    res.headers['Content-Type'] = 'application/json'
    return res

def updateActivityLater(userid, topic, displayName):
    p = entities.Participant.get_or_insert(userid)
    p.userId = userid
    p.topic = topic
    p.displayName = displayName
    p.put()

def _getActiveUsers():
    now = datetime.datetime.utcnow()
    min = now - datetime.timedelta(minutes=5)
    return entities.Participant.query(entities.Participant.lastUpdate > min).fetch(1000)

@app.route("/getActiveUsers")
def GetActiveUsers():
    q = _getActiveUsers()

    #q = [{"str": "foo", "int": 212, "date": datetime.datetime.today()}]
    #j = json.dumps(q, cls=MyEncoder)
    #j = json.dumps(([i.to_dict() for i in q]), default=mySerializer)
    #j = json.dumps(q, default=mySerializer)
    j = Helpers.toJson(q)
    res = Response(j)
    res.headers['Content-Type'] = 'application/json'
    return res

@app.route("/getNextTopic/<userId>")
def GetNextTopic(userId):
    r = random.randint(1, 10)
    isGetActive = r > 3 # 70%

    if not isGetActive:
        topics = _getRandomTopics()
        if len(topics) == 0: return None
        if topics[0] == 'null': return _getRandomTopics()[0]
        return topics[0]
    else:
        activeUsers = _getActiveUsers()

        d = defaultdict(int)
        for user in activeUsers:
            d[user.topic] += 1

        #x = sorted(d, itemgetter(1), reverse=True)

        x = sorted(d.items(), key=operator.itemgetter(1), reverse=True)
        #return Helpers.toJson(x)
        #x = json.dumps([i for i in x], default=mySerializer)
        #return x

        random.shuffle(x)
        if len(x) == 0 or x[0][0] == 'null':
            return _getRandomTopics()[0]
        return x[0][0]


'''
app2 = webapp2.WSGIApplication([
    ('/app', MainHandler),
    ('/login', LoginHandler),
    ('/test', TestHandler),
    ('/getUser', GetUserHandler),
], debug=True)

list_query = List.query()
list_query = list_query.filter(List.counter > 5)
list_query = list_query.filter(List.ignore == False)
list_keys = list_query.fetch(keys_only=True) # maybe put a limit here.

list_keys = random.sample(list_keys, 10)
lists = [list_key.get() for list_key in list_keys]
'''

@app.errorhandler(404)
def page_not_found(e):
    app.logger.error('Page not found: %s', (request.path))
    return "not found!"

@app.errorhandler(Exception)
def internal_server_error(e):
    code = 500
    app.logger.error('Server Error: %s', (e))
    if isinstance(e, HTTPException):
        code = e.code
    return jsonify(error=str(e)), code
