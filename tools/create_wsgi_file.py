#!/usr/bin/env python

import os

wsgifile = open('kitin.wsgi', 'w')
wsgifile.write("activate_this = '%s/kitin/bin/activate_this.py'\n" % os.environ.get('WORKON_HOME'))
wsgifile.write("execfile(activate_this, dict(__file__=activate_this))\n\n")
wsgifile.write("import sys\n")
wsgifile.write("sys.path.insert(0, '%s')\n" % os.getcwd())
wsgifile.write("from kitin import app as application\n")
wsgifile.write("application.config['MARC_MAP'] = '%s/marcmap.json' # Default value\n" % os.getcwd())
wsgifile.close()

