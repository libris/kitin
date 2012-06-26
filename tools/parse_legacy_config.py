from sys import argv, stdout
from os.path import join as pjoin
from ConfigParser import RawConfigParser
from collections import OrderedDict as odict
import json


confdir = argv[1]
enc = "latin-1"
lang = "sv"


def read_config(paths):
    cfg = RawConfigParser(allow_no_value=True)
    cfg.optionxform = str
    cfg.read(paths)
    return cfg


master_cfg = read_config(pjoin(confdir, "master.cfg"))

afix_cfg = read_config(pjoin(confdir, "Amarcfix.cfg"))
AUTH_CONFS = ["Amarc{0}xx.cfg".format(i) for i in xrange(9)]
a_cfg = read_config(pjoin(confdir, f) for f in AUTH_CONFS)

bfix_cfg = read_config(pjoin(confdir, "Bmarcfix.cfg"))
BIB_CONFS = ["Bmarc{0}xx.cfg".format(i) for i in xrange(10)]
b_cfg = read_config(pjoin(confdir, f) for f in BIB_CONFS)

#HOLDINGS_CONFS = ["Hmarc{0}xx.cfg".format(i) for i in (0, 3, 4, 6, 7, 8, 9)]
#hfix_cfg = read_config(pjoin(confdir, "Hmarcfix.cfg"))
#"country.cfg"
#"lang.cfg"


out = odict()


rec_map =  dict(master_cfg.items("RecFormat"))
#valid_recs = set(['Authority', 'Holding']
#        + ['Book', 'Computer', 'Map', 'Mixed', 'Music', 'Serial', 'Visual'])
#assert set(rec_map.values()) == valid_recs
out['recmap'] = rec_map

#fixed = out['fixed'] = odict()

categories = [('auth', "Authority", a_cfg),
              ('bib', "Bibliographic", b_cfg),]
              #('hold', "Holdings", h_cfg)]

for cat_id, name, cfg in categories:
    block = out[cat_id] = odict()
    section = name + " Fields"
    mandatory = master_cfg.items("Mandatory " + section) # TODO: parse + use
    for key, value in master_cfg.items(section):
        # Works only because these come after the field numbers..
        if key.startswith("Field"):
            block[key[5:]]['label_'+lang] = value.decode(enc)
        elif key.isdigit():
            tag, repeatable = value.rstrip().split()
            subfields = odict()
            ind1, ind2 = None, None
            if cfg.has_section(tag):
                for subkey, subval in cfg.items(tag):
                    # Works only because [...] after [...] ..
                    if subkey.startswith("Subf"):
                        code = subkey[4:]
                        if code in subfields:
                            subfields[code]['label_'+lang] = subval.decode(enc)
                    elif subkey.isdigit():
                        code, subrepeat_repr = subval.rstrip().split()
                        sub_repeatable = subrepeat_repr[0] == '1'
                        subfields[code] = dict(#id=None,
                                repeatable=sub_repeatable)
                indKey = tag + 'Ind1'
                if cfg.has_section(indKey):
                    ind1 = [repr(kv) for kv in cfg.items(indKey)] # TODO
                indKey = tag + 'Ind2'
                if cfg.has_section(indKey):
                    ind2 = [repr(kv) for kv in cfg.items(indKey)] # TODO
            dfn = dict(#id=None,
                    repeatable=bool(int(repeatable)),
                    ind1=ind1,
                    ind2=ind2,
                    subfield=subfields)
            block[tag] = dfn
        else:
            raise ValueError("Unknown block key: %s" % key)

json.dump(out, stdout, indent=2)

