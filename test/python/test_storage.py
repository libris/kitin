import os, shutil, json
from storage import Storage

def _test_extract_id_from_json():
    data = json.loads(open("fixture/7149593_formatted.json", "r").read())
    assert Storage.get_id(data) == "7149593"

def test_extract_type_from_json():
    data = json.loads(open("fixture/7149593_formatted.json", "r").read())
    assert Storage.get_type(data) == u"Record"

def test_save_json():
    """Verify that we can open the saved file and extract some data"""
    storage = Storage("some/path")
    org_file = open("fixture/7149593_formatted.json", "r")
    storage.save(json.loads(org_file.read()))
    assert json.loads(open("some/path/Record/7149593", "r").read())['@type'] == "Record"
    shutil.rmtree("some")

def test_update_json():
    """Saves the json and then updates it with a new value.
    Verifies that we can read back the new value from file"""
    storage = Storage("some/path")
    org_file = open("fixture/7149593_formatted.json", "r")
    with open("fixture/7149593_formatted.json", "r") as f:
        data = f.read()
        storage.save(json.loads(data))
        json_data = json.loads(data)
        json_data['@context'] = "yadda"
        storage.update(json_data)
    assert json.loads(open("some/path/Record/7149593", "r").read())['@context'] == "yadda"
    shutil.rmtree("some")

