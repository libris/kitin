import re
from sys import argv, stdout
from os.path import basename, join as pjoin
from ConfigParser import RawConfigParser
from collections import OrderedDict as odict
import json


if len(argv) < 3:
    print "Usage: {0} CONFIG_DIR LANG".format(basename(argv[0]))
    exit()

confdir = argv[1]
enc = "latin-1"
lang = argv[2]


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


def label_to_id(label):
    key = label.title()
    key = re.sub(r"\W", "", key)
    return key[0].lower() + key[1:]

def fixkey_to_prop_id(key):
    ref = re.sub(r"^\d+(/\d+)?", "", key)
    return ref[0].lower() + ref[1:]

out = odict()


categories = [('bib', "Bibliographic", b_cfg),
              ('auth', "Authority", a_cfg),]
              #('hold', "Holdings", h_cfg)]

for cat_id, name, cfg in categories:
    block = out[cat_id] = odict()
    section = name + " Fields"
    mandatory = master_cfg.items("Mandatory " + section) # TODO: parse + use
    for key, value in master_cfg.items(section):
        # Works only because these come after the field numbers..
        if key.startswith("Field"):
            tagref = key[5:]
            field, label = block[tagref], value.decode(enc)
            if lang == 'en':
                field['id'] = label_to_id(label)
            field['label_'+lang] = label
        elif key.strip().isdigit():
            tag, repeatable = value.rstrip().split()
            subfields = odict()
            inds = [None, None]
            if cfg.has_section(tag):
                for subkey, subval in cfg.items(tag):
                    # Works only because [...] after [...] ..
                    if subkey.startswith("Subf"):
                        code = subkey[4:]
                        if code in subfields:
                            subfield, label = subfields[code], subval.decode(enc)
                            if lang == 'en':
                                subfield['id'] = label_to_id(label)
                            subfield['label_'+lang] = label
                    elif subkey.isdigit():
                        code, subrepeat_repr = subval.rstrip().split(None, 1)
                        sub_repeatable = subrepeat_repr[0] == '1'
                        subfields[code] = subfield = odict(id=None)
                        subfield['label_'+lang] = None
                        subfield['repeatable'] = sub_repeatable
                for i in (1, 2):
                    indKey = '{0}Ind{1}'.format(tag, i)
                    if cfg.has_section(indKey):
                        ind = inds[i-1] = odict()
                        for indcode, indval in cfg.items(indKey):
                            if indcode.startswith('Value'):
                                ind[indcode[5:]] = indval.decode(enc)
            dfn = odict(id=None)
            dfn['label_'+lang] = None
            dfn['repeatable'] = bool(int(repeatable))
            for i, ind in enumerate(inds):
                if ind:
                    dfn['ind' + str(i+1)] = ind
            if subfields:
                dfn['subfield'] = subfields
            block[tag] = dfn
        else:
            raise ValueError("Unknown block key: %s" % key)


rec_term_map = odict()
for combo, term in master_cfg.items("RecFormat"):
    rec_term_map.setdefault(term, set()).add(combo)
#assert set(rec_term_map) == set(['Authority', 'Holding']
#        + ['Book', 'Computer', 'Map', 'Mixed', 'Music', 'Serial', 'Visual'])


for block_key, fix_tags, fix_cfg in [
        ('bib', ['000', '006', '007', '008'], bfix_cfg),
        ('auth', ['000', '008'], afix_cfg)]:
    block = out[block_key]
    fixprops = block['fixprops'] = odict()
    _fixprop_unique = {}

    for tagcode in fix_tags:
        fixmaps = odict()
        for key, value in fix_cfg.items(tagcode + 'Code'):
            tablelabel, tablename = value.split(',')
            tablename = tablename.strip()
            table = fixmaps.setdefault(tablename, odict())
            table['name'] = tablename
            table.setdefault('matchKeys', []).append(key)
            if tablelabel in rec_term_map:
                table['term'] = tablelabel
                table['matchRecTypeBibLevel'] = list(rec_term_map[tablelabel])
            else:
                table['label_'+lang] = tablelabel.decode(enc)
            columns = table['columns'] = []
            for tablerow, tableval in fix_cfg.items(tablename):
                if tableval:
                    tablerow = tablerow + tableval
                cells = [s.strip() for s in tablerow.decode(enc).split(',')]
                label, enumkey, offset, length, default = cells
                col = odict()
                col['label_'+lang] = label
                col['offset'] = int(offset)
                col['length'] = int(length)
                col['default'] = default
                prop_id = fixkey_to_prop_id(enumkey)
                if fix_cfg.has_section(enumkey):
                    # ensure converted name is still unique
                    if prop_id in _fixprop_unique:
                        assert _fixprop_unique[prop_id] == enumkey
                    else:
                        _fixprop_unique[prop_id] = enumkey
                    col['propRef'] = prop_id
                    if prop_id not in fixprops:
                        fixprops[prop_id] = dict((k, v.decode(enc))
                                for k, v in fix_cfg.items(enumkey))
                else:
                    col['placeholder'] = prop_id
                columns.append(col)

        block[tagcode]['fixmaps'] = fixmaps.values()


json.dump(out, stdout, indent=2)

