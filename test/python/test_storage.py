import os, shutil, json
from storage import Storage

def test_extract_id_from_json():
    storage = Storage("some/path")
    data = json.loads(open("fixture/7149593_formatted.json", "r").read())
    assert data['@id'].rsplit("/",1)[1] == "7149593"

def test_extract_type_from_json():
    storage = Storage("some/path")
    data = json.loads(open("fixture/7149593_formatted.json", "r").read())
    assert data['@type'] == u"Record"

def test_save_json():
    """Verify that we can open the saved file and extract some data"""
    storage = Storage("some/path")
    org_file = open("fixture/7149593_formatted.json", "r")
    storage.save(json.loads(org_file.read()))
    assert json.loads(open("some/path/Record/7149593", "r").read())['@type'] == "Record"
    shutil.rmtree("some")

