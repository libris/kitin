#!/usr/bin/env python
# -*- coding: utf-8 -*-
import pickle
import json
import requests
import os
from sqlalchemy import MetaData, Table, create_engine, exists, and_
from sqlalchemy.orm import mapper
from flask_login import UserMixin


class User(UserMixin):
    __tablename__ = 'userdata'
    def __init__(self, username, password="Secret", active=True):
        try:
            print "---initiating User", username, password
            self.username = unicode(username)
            self.password = unicode(password)
            self.active = active
            print "---initiated User"
        except Excetion as e:
            print "gick inge bra: ", e

    def __repr__(self):
        return '<User %r>' % (self.username) 

    def get_id(self):
        return self.username

    def is_active(self):
        return self.active


#    def is_authenticated(self):
#        return True

class Storage(object):

    def __init__(self, config):
        self.db = db = create_engine("%(DBENGINE)s:///%(DBPATH)s%(DBNAME)s" % config)
        db.echo = True
        self.metadata = MetaData(db)
        self.cfg = config
        

    def _get_table(self, tname = 'marcpost'):
        return Table(tname, self.metadata, autoload=True)

    def save(self, id, json_data):
        table = self._get_table()
        insert = table.insert()
        insert.execute(id=id, marc=pickle.dumps(json_data))

    def save2(self, bibid, userid, json_data):
        table = self._get_table()
        inserter = table.insert()
        result = inserter.execute(marc=pickle.dumps(json_data),
                bibid=bibid, userid=userid)
        return result.last_inserted_ids()[0]

    def update(self, id, json_data):
        table = self._get_table()
        newmp = table.update().where(table.c.id == id).values(
                marc=pickle.dumps(json_data))
        self.db.execute(newmp)

    def delete(self, id):
        table = self._get_table()
        self.db.execute(table.delete().where(table.c.id == id))

    def exists(self, id):
        table = self._get_table()
        return table.select().where(exists([table.c.id], and_(table.c.id == id))).execute().scalar()

    def find_by_user(self, uid):
        table = self._get_table()
        query = table.select(table.c.userid == uid)
        items = query.execute().fetchall()
        for item in items:
            yield Marcpost(item.id, pickle.loads(item.marc))

    def load_user_original(self, uname, password):
        """ Not working, move bibdb request to new load_user when api is ready"""
        users = self._get_table('userdata')
        u = users.select(users.c.username == uname).execute().first()
        reply = requests.get('http://biblioteksdatabasen/api/user/role', {username: uname})
        roles = json.loads(reply.text)['roles']
        if u and len(u) > 0:
            user = User(u.username)
            users.update().where(users.c.id == u.id).values(roles=pickle.dumps(roles)).execute()
        else:
            (users.insert(username=uname, roles=pickle.dumps(roles))).execute()
            user = User(uname)

        return user



    def load_user(self, uname, pword, remember):
        """
        If user not in bibdb, return None
        If user in bibdb, return User object from kitin.
        If user in kitin, update with roles from bibdb and return, 
        else create new, with roles from bibdb and return."""
        #remove next 2 lines for real login, i.e. login user from form
        #uname = self.cfg.get('BIBDB_USER')
        #pword = self.cfg.get('BIBDB_PASS')

        ak = self.cfg.get('BIBDB_API_KEY')
        udata = "username=%s&password=%s" % (uname, pword)
        apiheaders = {"APIKEY_AUTH_HEADER": "%s" % ak}
        reply = requests.post('https://bibdb.libris.kb.se/api/login/auth', data=udata, headers=apiheaders)
        try:
            if reply.text == "Authenticated":
                print "authenticated"
                udata = "username=%s"%uname
                rolereply = requests.get('https://bibdb.libris.kb.se/api/user/role', params = {'username': uname}, headers=apiheaders)
                print "got rolereply", rolereply
                roles = rolereply.text  
                print "got roles", roles
                users = self._get_table('userdata')
                print "got users"
                u = users.select(users.c.username == uname).execute().first()
                print "got u"
                if u and len(u) > 0:
                    print "known user: ", u
                    user = u
                else:
                    print "unknown user, making new"
                    try:
                        insert = users.insert()
                        insert.execute(username = uname, active = 1)
                    except Exception as e:
                        print "fail: ", e
                newvalues = users.update().where(users.c.username == uname).values(active = 1, roles = roles).execute()
                user = users.select(users.c.username == uname).execute().first()
                print "user: ", user
                return User(user.username)
            else:
                return None
        except:
            return None


        









#from collections import namedtuple
#Marcpost = namedtuple('Marcpost', "id, marc")


