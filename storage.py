#!/usr/bin/env python
# -*- coding: utf-8 -*-
import json
import os
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

    def save_draft(self, user_id, rec_type, rec_id, json_data, etag):
        path = construct_path([self.path, user_id, rec_type])
        create_dir_if_not_exists(path)
        filename = "/".join([path, rec_id])
        with open(filename, 'w') as f:
            f.write(json_data)

    def update_draft(self, user_id, rec_type, rec_id, json_data, etag):
        self.save_draft(user_id, rec_type, rec_id, json_data, etag)

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
        if os.path.exists(filename):
            os.remove(filename)

    def get_drafts(self, user_id):
        result = {}
        for root, subFolders, files in os.walk(construct_path([self.path, user_id])):
            for file in files:
                f = os.path.join(root,file)
                result["/".join(f.rsplit("/",2)[-2:])] = f
        return result

    def get_drafts_as_json(self, user_id):
        result = {}
        drafts = []
        for root, subFolders, files in os.walk(construct_path([self.path, user_id])):
            for file in files:
                f = os.path.join(root,file)
                item = {}
                item['type'] = f.rsplit("/",2)[-2:-1][0]
                item['id'] = f.rsplit("/",2)[-1:][0]
                item['path'] = f
                drafts.append(item)
        result['drafts'] = drafts
        return json.dumps(result)

    def draft_exists(self, rec_type, rec_id):
        return os.path.exists("/".join([self.path, rect_type, rec_id]))


def construct_path(path_array):
    return "/".join(path_array)

def create_dir_if_not_exists(path):
    if not os.path.exists(str(path)):
        os.makedirs(path)

