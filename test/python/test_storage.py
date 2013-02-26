import os, shutil, json
from storage import Storage

basedir = os.path.dirname(__file__) + "/"

def test_save_json():
    """Verify that we can open the saved file and extract some data"""
    storage = Storage("some/path")
    with open(basedir + "fixture/7149593_formatted.json", "r") as f:
        storage.save("bib", "7149593", json.loads(f.read()))
    with open("some/path/bib/7149593", "r") as f:
        id_of_data = json.loads(f.read())['@id'].rsplit("/",1)[1]
        assert  id_of_data == '7149593'
    shutil.rmtree("some")

def test_update_json():
    """Saves the json and then updates it with a new value.
    Verifies that we can read back the new value from file"""
    storage = Storage("some/path")
    with open(basedir + "fixture/7149593_formatted.json", "r") as f:
        data = f.read()
        storage.save("bib", "7149593", json.loads(data))
        json_data = json.loads(data)
        json_data['@context'] = "yadda"
        storage.update("bib", "7149593", json_data)
        assert json.loads(open("some/path/bib/7149593", "r").read())['@context'] == "yadda"
    shutil.rmtree("some")

def test_delete_json():
    storage = Storage("some/path")
    with open(basedir + "fixture/7149593_formatted.json", "r") as f:
        json_data = json.loads(f.read())
    storage.save("bib", "7149593", json_data)
    storage.delete("bib", "7149593")
    shutil.rmtree("some")

def test_read_json():
    storage = Storage("some/path")
    with open(basedir + "fixture/7149593_formatted.json", "r") as f:
        data = f.read()
        storage.save("bib", "7149593", json.loads(data))
        json_data = json.loads(data)
        our_json_data = json.loads(storage.read("bib", "7149593"))
        assert our_json_data['@id'].rsplit("/",1)[1] == '7149593'
    shutil.rmtree("some")

