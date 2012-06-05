from sys import argv
from ConfigParser import RawConfigParser

cfg = RawConfigParser(allow_no_value=True)
cfg.optionxform = str
#print help(cfg)
cfg.read(argv[1:])
#for item in cfg.items('006_Maps'): print item
for section in cfg.sections():
    print section
    for item in cfg.items(section):
        print "  ", item
    print
