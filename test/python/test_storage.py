import os, shutil, json
from storage import Storage
from nose.tools import with_setup

basedir = os.path.dirname(__file__) + "/"

## TODO: include the fixture file in setup as well
def setup():
    global storage
    storage = Storage(basedir + "some/path")
    global user_id
    user_id = u'12345'

def teardown():
    shutil.rmtree(basedir + "some")

@with_setup(setup)
def test_save_draft():
    """Verify that we can open the saved file and extract some data"""
    with open(basedir + "fixture/7149593_formatted.json", "r") as f:
        storage.save_draft(user_id, "bib", "7149593", json.loads(f.read()))
    with open(basedir + "some/path/" + user_id + "/bib/7149593", "r") as f:
        id_of_data = json.loads(f.read())['@id'].rsplit("/",1)[1]
        assert  id_of_data == '7149593'

@with_setup(setup)
def test_update_draft():
    """Saves the json and then updates it with a new value.
    Verifies that we can read back the new value from file"""
    with open(basedir + "fixture/7149593_formatted.json", "r") as f:
        data = f.read()
        storage.save_draft(user_id, "bib", "7149593", json.loads(data))
        json_data = json.loads(data)
        json_data['@context'] = "yadda"
        storage.update_draft(user_id, "bib", "7149593", json_data)
        assert json.loads(open(basedir + "some/path/" + user_id + "/bib/7149593", "r").read())['@context'] == "yadda"

@with_setup(setup)
def test_delete_draft():
    with open(basedir + "fixture/7149593_formatted.json", "r") as f:
        json_data = json.loads(f.read())
    storage.save_draft(user_id, "bib", "7149593", json_data)
    storage.delete_draft(user_id, "bib", "7149593")

@with_setup(setup)
def test_get_draft_json():
    with open(basedir + "fixture/7149593_formatted.json", "r") as f:
        data = f.read()
        storage.save_draft(user_id, "bib", "7149593", json.loads(data))
        json_data = json.loads(data)
        our_json_data = json.loads(storage.get_draft(user_id, "bib", "7149593"))
        assert our_json_data['@id'].rsplit("/",1)[1] == '7149593'

def test_get_draft_non_existent_file():
    storage = Storage("some/path")
    assert storage.get_draft(user_id, "bib", "2") == None
    
