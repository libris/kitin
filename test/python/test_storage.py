import os, shutil, json
from storage import Storage, construct_path
from nose.tools import with_setup

basedir = os.path.dirname(__file__) + "/"

## TODO: include the fixture file in setup as well
def setup():
    global storage
    storage = Storage(basedir + "some/path")
    global user_id
    user_id = u'12345'

def teardown():
  #  if os.path.exists(basedir + "some"):
  #      shutil.rmtree(basedir + "some")
    None

def test_construct_path():
    assert construct_path(["a", "b", "c"]) == "a/b/c"

@with_setup(setup, teardown)
def test_save_draft():
    """Verify that we can open the saved file and extract some data from that file"""
    with open(basedir + "fixture/7149593_formatted.json", "r") as f:
        meta_record = storage.save_draft(user_id, "bib", f.read(), "1362044230872", "7149593")
        assert meta_record['etag'] == "1362044230872"
    with open(basedir + "some/path/" + user_id + "/bib/7149593", "r") as f:
        json_data = json.loads(f.read())
        assert json_data['@id'].rsplit("/",1)[1] == '7149593'

@with_setup(setup, teardown)
def test_update_draft():
    """Saves the json and then updates it with a new value.
    Verifies that we can read back the new value from file"""
    with open(basedir + "fixture/7149593_formatted.json", "r") as f:
        data = f.read()
        saved_meta_record = storage.save_draft(user_id, "bib", data, "1362044230872", "7149593")
        json_data = json.loads(data)
        json_data['about']['instanceTitle']['titleValue'] = "yadda"
        updated_meta_record = storage.update_draft(user_id, "bib", json.dumps(json_data), "1362044230872", "7149593")
        assert json.loads(open(basedir + "some/path/" + user_id + "/bib/7149593", "r").read())['about']['instanceTitle']['titleValue'] == "yadda"
        assert saved_meta_record['@id'] == updated_meta_record['@id']
        assert saved_meta_record['modified'] != updated_meta_record['modified']

@with_setup(setup, teardown)
def test_delete_draft():
    with open(basedir + "fixture/7149593_formatted.json", "r") as f:
        data = f.read()
        json_data = json.loads(data)
    storage.save_draft(user_id, "bib", data, "1362044230872", "7149593")
    assert storage.draft_exists(user_id, "bib", "7149593")
    storage.delete_draft(user_id, "bib", "7149593")
    assert not storage.draft_exists(user_id, "bib", "7149593")

@with_setup(setup, teardown)
def test_get_draft_json():
    with open(basedir + "fixture/7149593_formatted.json", "r") as f:
        data = f.read()
        meta_record = storage.save_draft(user_id, "bib", data, "1362044230872", "7149593")
        assert meta_record['@id']  == '7149593'
        json_data = json.loads(data)
        our_json_data = json.loads(storage.get_draft(user_id, "bib", "7149593"))
        assert our_json_data['@id'].rsplit("/",1)[1] == '7149593'

def test_get_draft_non_existent_file():
    storage = Storage("some/path")
    assert storage.get_draft(user_id, "bib", "2") == None
    
@with_setup(setup, teardown)
def test_get_drafts():
    with open(basedir + "fixture/7149593_formatted.json", "r") as f:
        data = f.read()
        storage.save_draft(user_id, "bib", data, "1362044230872", "1234567")
        storage.save_draft(user_id, "other", data, "1362044230872", "987654")
    our_path = storage.path + "/" + user_id + "/" + "bib" + "/" + "1234567"
    print(len(storage.get_drafts_index(user_id)))
    assert len(storage.get_drafts_index(user_id)) == 2

