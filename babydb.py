#!/usr/bin/env python
from sqlalchemy import *
from sqlalchemy.orm import *
import json


db = create_engine('sqlite:///kitin.db')
db.echo = True
metadata = MetaData(db)
marcpost = Table('marcpost', metadata,
    Column('id', Integer, primary_key=True),
    Column('userid', String),
    Column('marc', PickleType(pickler=json)),
    Column('bibid', String),
    Column('spill', PickleType(pickler=json))
    #Column('100', String),
    #Column('245', Integer),
)
#marcpost.create()

class Marcpost(object):
    def __repr__(self):
        return "Userid: %s, postid: %s" %(self.userid, self.id)
    
    #def __init__(self):
        

mapper(Marcpost, marcpost)


"""
i = marcpost.insert()
i.execute(marc={'ett': 'ettan'}, spill="nothing yet")

s = marcpost.select()
rs = s.execute()

row = rs.fetchone()

for row in rs:
    print row.id, 'wrote', row.marc
"""
