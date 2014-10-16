#!/usr/bin/env python
# -*- coding: utf-8 -*-
import json
import os
import uuid
from datetime import datetime, tzinfo, timedelta


class simple_utc(tzinfo):
    def tzname(self):
        return "UTC"
    def utcoffset(self, dt):
        return timedelta(0)
#from sqlalchemy import MetaData, Table, create_engine


#class UserStorage(object):
    #def __init__(self, config):
        #self.db = create_engine("%(DBENGINE)s:///%(DBPATH)s%(DBNAME)s" % config, echo = True)
        #self.metadata = MetaData(self.db)
        #self.cfg = config
    
    #def get_table(self):
        #return Table('userdata', self.metadata, autoload = True)
    
    #def load_user(self, uname, sigel):
        #try:
            #connection = self.db.connect()
            #users = self.get_table()
            #select_query = select([users], users.c.username == uname)
            #selected_user = connection.execute(select_query)
            #selected_user = users.select(users.c.username == uname).execute().first()
            #if selected_user and len(selected_user) > 0:
                #user = selected_user
                #print "Found user %s" % selected_user
            #else:
                #insert = users.insert().values(username = uname, active = True)
                #connection.execute(insert)
            #uppdatera sigel
            #skapa ett userobjekt
                #insert.execute(username = uname, active = 1)
        #except Exception as e:
            #print "Error trying to load user: ", e
            #return None
                
                #newvalues = users.update().where(users.username == uname).values(active = 1, sigel = sigel).execute()
                #user = users.select(users.c.username == uname).execute().first()
                #return user

    

class Storage(object):
    def __init__(self, path):
        self.path = path
        if not os.path.exists(self.path):
            os.makedirs(self.path)

    def get_record_summary(rec_type, rec_id, json_data, etag):
        print rec_id

    def rw_index(self, path, callback, params={}):
        filename = "/".join([path, 'index.json'])
        if not os.path.exists(path):
            return {}
        else:
            with open(filename, 'a+') as f:
                # Read index
                f.seek(0)
                draft_index = f.read()
                
                # Load or initiate
                if draft_index != '':
                    draft_index = json.loads(draft_index)
                else:
                    draft_index = { 'user': params['user_id'], 'drafts': [] }

                if callback:
                    draft_index = callback(draft_index, params)
                # Trucate
                f.seek(0)
                f.truncate()
                # Update
                f.write(json.dumps(draft_index))
                return draft_index

    def add_to_index(self, user_id, rec_type, rec_id, record, etag, path):

        def do_update_index(draft_index, params):
            
            match_index = self.find_in_index(draft_index, params['meta_record']['@id'])

            # Update or add meta record
            if match_index is None:
                draft_index['drafts'].append(params['meta_record'])
            else:
                draft_index['drafts'][match_index] = params['meta_record']

            return draft_index

        # Perhaps we should put a little more logic here, instead of just including instanceTitle and publication?
        meta_record = {
                          '@id': record['@id'],
                          'etag': etag,
                          'modified': record['modified'],
                          'instanceTitle': record['about']['instanceTitle'],
                          'publication': record['about']['publication']
                      }
        # Only add responsibilityStatement if it exist.
        if 'responsibilityStatement' in record['about']:
            meta_record['creator'] = record['about']['responsibilityStatement']
        elif 'performerNote' in record['about']:
            if len(record['about']['performerNote']) > 0:
                meta_record['creator'] = record['about']['performerNote'][0]

        self.rw_index(path, do_update_index, { 'meta_record': meta_record, 'user_id': user_id})
        return meta_record

    def remove_from_index(self, user_id, rec_type, rec_id):
        def do_remove_index(draft_index, params):
            for idx, d in enumerate(draft_index['drafts']):
                if d['@id'] == '/' + '/'.join([rec_type, params['rec_id']]):
                    draft_index['drafts'].remove(d)
            return draft_index
        self.rw_index(construct_path([self.path, user_id]), do_remove_index, {'rec_id': rec_id, 'user_id': user_id})

    def save_draft(self, user_id, rec_type, json_record, etag, rec_id=None):
        if rec_id is None or rec_id == 'new':
            rec_id = construct_id(rec_type)

        path = construct_path([self.path, user_id, rec_type])
        create_dir_if_not_exists(path)

        record = json.loads(json_record)
        record['draft'] = True
        record['@id'] = '/' + '/'.join([rec_type, rec_id])
        record['modified'] = datetime.utcnow().replace(tzinfo=simple_utc()).isoformat()

        with open(construct_path([path, rec_id]), 'w') as f:
            f.write(json.dumps(record))
        meta_record = self.add_to_index(user_id, rec_type, rec_id, record, etag, construct_path([self.path, user_id]))
        return record

    def update_draft(self, user_id, rec_type, json_data, etag, rec_id):
        return self.save_draft(user_id, rec_type, json_data, etag, rec_id)

    def get_draft(self, user_id, rec_type, rec_id):
        path = construct_path([self.path, user_id, rec_type])
        filename = "/".join([path, rec_id])
        if os.path.exists(filename):
            with open(filename) as f:
                return open(filename, 'r').read()
        else:
            None

    def delete_draft(self, user_id, rec_type, rec_id):
        filename = construct_path([self.path, user_id, rec_type, rec_id])
        print filename
        if os.path.exists(filename):
            os.remove(filename)
            return self.remove_from_index(user_id, rec_type, rec_id)


    def get_drafts_index(self, user_id):
        def read_index(draft_index, params):
            return draft_index

        path = construct_path([self.path, user_id])
        return self.rw_index(path, read_index, {'user_id': user_id})

    def draft_exists(self, user_id, rec_type, rec_id):
        return os.path.exists("/".join([self.path, user_id, rec_type, rec_id])) and (self.find_in_index(self.get_drafts_index(user_id), rec_id) is not None)

    def find_in_index(self, draft_index, rec_id):
        match_index = None
        # Find meta record in index    
        for idx, d in enumerate(draft_index['drafts']):
            if d['@id'] == rec_id:
                match_index = idx
                break
        return match_index

def construct_id(rec_type):
    return 'draft-' + str(uuid.uuid4())

def construct_path(path_array):
    return "/".join(path_array)

def create_dir_if_not_exists(path):
    if not os.path.exists(str(path)):
        os.makedirs(path)



