# -*- coding: UTF-8 -*-
from time import sleep
from nose.tools import with_setup
from selenium.webdriver import Firefox
from webdry import *


def setup():
    env.start_page_url = "http://127.0.0.1:5000"
    start_browser(Firefox())

def teardown():
    stop_browser()

def user_session(user=u"test", password=u"test"):
    def start_session():
        get(env.start_page_url)
        do_login(user, password)
    def stop_session():
        delete_all_cookies()
    return with_setup(start_session, stop_session)


def do_login(user, password):
    find(name="username").send_keys(user)
    find(name="password").send_keys(password)
    find(".submit button[type=submit]").click()

def do_logout():
    find('.username').click()
    find(link_text="Logga ut").click()

def do_search(q):
    search_field = find('form[name=search_form] input[name=q]')
    search_field.clear()
    search_field.send_keys(q, Keys.RETURN)


def test_login_logout():
    get(env.start_page_url)
    do_login(u"test", u"test")
    assert find('.username').text.lower().startswith(u"test")
    do_logout()
    with waits(0):
        assert find('.username') is None

@user_session()
def test_searches():
    do_search("*")
    assert find('body.search') and find('section.result.record')
    back()
    do_search("Tove")
    # goes directly to first result
    assert find('body.edit') and find('form#record')
    assert find('input[name=isbn]').get_attribute('value') == u"9100563226"

@user_session()
def test_edit():
    get(env.start_page_url + "/edit/bib/7149593")
    sleep(1.0) # TODO: watch something appearing on init
    modinfo = find('section.modificationinfo')
    summary = find('*[data-ng-model="work.summary"]')
    summary.send_keys(Keys.BACK_SPACE, Keys.BACK_SPACE, Keys.BACK_SPACE)
    summary.send_keys("...")
    assert 'saved' not in modinfo.get_attribute('class').split()
    find('button#draft').click()
    for i in range(5):
        if 'saved' in modinfo.get_attribute('class').split():
            break
        sleep(0.2)
    else:
        assert False, "Change not saved"
    env.driver.refresh()
    summary = find('*[data-ng-model="work.summary"]')
    assert summary.get_attribute('value') == "..."
    summary.send_keys(Keys.BACK_SPACE, Keys.BACK_SPACE, Keys.BACK_SPACE)
    find('button#draft').click()

