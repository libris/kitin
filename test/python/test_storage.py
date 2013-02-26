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

def test_delete_json():
    storage = Storage("some/path")
    org_file = open("fixture/7149593_formatted.json", "r")
    json_data = json.loads(org_file.read())
    storage.save(json_data)
    storage.delete(Storage.get_type(json_data), Storage.get_id(json_data))
    shutil.rmtree("some")

def test_read_json():
    storage = Storage("some/path")
    with open("fixture/7149593_formatted.json", "r") as f:
        data = f.read()
        storage.save(json.loads(data))
        json_data = json.loads(data)
        data_type = Storage.get_type(json_data)
        data_id = Storage.get_id(json_data)
        our_json_data = json.loads(storage.read(data_type, data_id))
        assert Storage.get_id(our_json_data) == '7149593'
    shutil.rmtree("some")

