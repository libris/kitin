Web Tests
========================================================================

## Prerequisites ##

    $ pip install -r requirements.txt

## Usage ##

1. Ensure that a local instance of the web app is up and running (on port 5000).

2. Run all tests (from within this directory):

    $ nosetests

## Development ##

Add a new `test_*` function in `test_webapp.py` for every new scenario.

For repetitive runs, some useful flags are:

    $ nosetests --rednose --immediate --failed

For information about `webdry` (a minimal wrapper for selenium webdriver), see:
<https://bitbucket.org/niklasl/webdry/wiki/Home>.

For information about `selenium.webdriver`, see:
<http://readthedocs.org/docs/selenium-python/en/latest/>.

