#import hashlib
#from hashlib import md5
import base64
import json

def mytest2():
    return "this is my test!"

class UserSession(object):
    def __init__(self, userId, email):
        self.email = email
        self.userId = userId

    def getEncrypted(self):
        return self.encrypt(self)

    def getJson(self, userSession):
        return json.dumps(userSession.__dict__)

    def encrypt(self, userSession):
        return UserSession.encode('abc', self.getJson(userSession))

    @staticmethod
    def decrypt(str):
        j = UserSession.decode('abc', str)
        jo = json.loads(j)
        return UserSession(**jo)


    '''
    def __repr__(self):
        return json.dumps(self)

    @classmethod
    def decrypt(cls, encryptedToken):
        ret = cls('', '')
        ret.encrypted = encryptedToken
        return ret
    '''

    @staticmethod
    def computeMD5hash(string):
        import hashlib
        from hashlib import md5
        m = hashlib.md5()
        m.update((string))
        md5string = m.digest()
        return md5string

    @staticmethod
    def encode(key, clear):
        enc = []
        for i in range(len(clear)):
            key_c = key[i % len(key)]
            enc_c = chr((ord(clear[i]) + ord(key_c)) % 256)
            enc.append(enc_c)
        return base64.urlsafe_b64encode("".join(enc))

    @staticmethod
    def decode(key, enc):
        dec = []
        enc = base64.urlsafe_b64decode(enc)
        for i in range(len(enc)):
            key_c = key[i % len(key)]
            dec_c = chr((256 + ord(enc[i]) - ord(key_c)) % 256)
            dec.append(dec_c)
        return "".join(dec)

def mySerializer(obj):
    if hasattr(obj, 'isoformat'):
        return obj.isoformat()
    if hasattr(obj, '__dict__'):
        return obj.__dict__
    if hasattr(obj, '__srt__'):
        return obj.__srt__
    if hasattr(obj, '__repr__'):
        return obj.__repr__
    raise TypeError


'''
class MyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime.datetime):
            return int(mktime(obj.timetuple()))

        return json.JSONEncoder.default(self, obj)

class DictModel(db.Model):
    def to_dict(self):
        return dict([(p, unicode(getattr(self, p))) for p in self.properties()])
'''

class Payload(object):
    def __init__(self, j):
        self.__dict__ = json.loads(j)

class Helpers:
    @staticmethod
    def toJson(obj):
        #return json.dumps(self, default=lambda o: o.__dict__,
        #    sort_keys=True, indent=4)
        if len(obj) == 0: return ''
        if isinstance(obj, list):
            if hasattr(obj[0], 'to_dict'):
                return json.dumps([i.to_dict() for i in obj], default=mySerializer)
            else:
                return json.dumps([i for i in obj], default=mySerializer)

        return json.dumps(obj, default=mySerializer)

class Object:
    def toJSON(self):
        #return json.dumps(self, default=lambda o: o.__dict__,
        #    sort_keys=True, indent=4)
        return json.dumps(self, default=mySerializer)

#print json.dumps(data, default=date_handler)
