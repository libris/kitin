import os, shutil, json
from storage import Storage

basedir = os.path.dirname(__file__) + "/"

def test_save_draft():
    """Verify that we can open the saved file and extract some data"""
    storage = Storage("some/path")
    with open(basedir + "fixture/7149593_formatted.json", "r") as f:
        storage.save_draft("bib", "7149593", json.loads(f.read()))
    with open("some/path/bib/7149593", "r") as f:
        id_of_data = json.loads(f.read())['@id'].rsplit("/",1)[1]
        assert  id_of_data == '7149593'
    shutil.rmtree("some")

def test_update_draft():
    """Saves the json and then updates it with a new value.
    Verifies that we can read back the new value from file"""
    storage = Storage("some/path")
    with open(basedir + "fixture/7149593_formatted.json", "r") as f:
        data = f.read()
        storage.save_draft("bib", "7149593", json.loads(data))
        json_data = json.loads(data)
        json_data['@context'] = "yadda"
        storage.update_draft("bib", "7149593", json_data)
        assert json.loads(open("some/path/bib/7149593", "r").read())['@context'] == "yadda"
    shutil.rmtree("some")

def test_delete_draft():
    storage = Storage("some/path")
    with open(basedir + "fixture/7149593_formatted.json", "r") as f:
        json_data = json.loads(f.read())
    storage.save_draft("bib", "7149593", json_data)
    storage.delete_draft("bib", "7149593")
    shutil.rmtree("some")

def test_get_draft_json():
    storage = Storage("some/path")
    with open(basedir + "fixture/7149593_formatted.json", "r") as f:
        data = f.read()
        storage.save_draft("bib", "7149593", json.loads(data))
        json_data = json.loads(data)
        our_json_data = json.loads(storage.get_draft("bib", "7149593"))
        assert our_json_data['@id'].rsplit("/",1)[1] == '7149593'
    shutil.rmtree("some")

def test_get_draft_non_existent_file():
    storage = Storage("some/path")
    assert storage.get_draft("bib", "2") == None
    
