#!/usr/bin/env python
import pickle
import json
from sqlalchemy import MetaData, Table, create_engine, exists, and_
from sqlalchemy.orm import mapper


class Storage(object):

    def __init__(self, config):
        self.db = db = create_engine("%(DBENGINE)s:///%(DBNAME)s" % config)
        db.echo = True
        self.metadata = MetaData(db)

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

    def load_user(self, uname, password):
        """If user in kitin, update with roles from bibdb and return, 
        else create new, with roles from bibdb and return."""
        users = self._get_table('userdata')
        u = users.select(users.c.username == uname).execute().first()
        reply = requests.get('http://biblioteksdatabasen/api/user/role', {username: uname})
        roles = json.loads(reply.text)['roles']
        if len(u) > 0:
            user = User(u.username)
            users.update().where(users.c.id == u.id).values(roles=pickle.dumps(roles)).execute()
        else:
            (users.insert(username=uname, roles=pickle.dumps(roles))).execute()
            user = User(uname)

        return user









from collections import namedtuple
Marcpost = namedtuple('Marcpost', "id, marc")


#marcpost = Table('marcpost', metadata,
#    Column('id', Integer, primary_key=True),
#    Column('userid', String),
#    Column('marc', PickleType(pickler=json)),
#    Column('bibid', String),
#    Column('spills', PickleType(pickler=json))
#    #Column('100', String),
#    #Column('245', Integer),
#)
##marcpost.create()
#
#class Marcpost(object):
#    def __repr__(self):
#        return "Userid: %s, postid: %s" %(self.userid, self.id)
#
#    #def __init__(self):
#
#
#mapper(Marcpost, marcpost)


#i = marcpost.insert()
#i.execute(marc={'ett': 'ettan'}, spill="nothing yet")
#
#s = marcpost.select()
#rs = s.execute()
#
#row = rs.fetchone()
#
#for row in rs:
#    print row.id, 'wrote', row.marc
