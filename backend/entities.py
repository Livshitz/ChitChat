from google.appengine.ext import ndb

class Counter(ndb.Model):
    COUNTER_KEY = 'default counter'
    count = ndb.IntegerProperty(indexed=False)

class Participant(ndb.Model):
    userId = ndb.StringProperty(indexed=True)
    displayName = ndb.StringProperty(indexed=True)
    topic = ndb.StringProperty(indexed=True)
    lastUpdate = ndb.DateTimeProperty(indexed=True, auto_now=True)

class TopicsContainer(ndb.Model):
    DEFAULT_KEY = 'default'
    topics = ndb.StringProperty(repeated=True)