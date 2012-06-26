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
            block[key[5:]]['label_'+lang] = value.decode(enc)
        elif key.isdigit():
            tag, repeatable = value.rstrip().split()
            subfields = odict()
            inds = [None, None]
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
                        subfields[code] = dict(
                                repeatable=sub_repeatable)
                for i in (1, 2):
                    indKey = '{0}Ind{1}'.format(tag, i)
                    if cfg.has_section(indKey):
                        ind = inds[i-1] = odict()
                        for indcode, indval in cfg.items(indKey):
                            if indcode.startswith('Value'):
                                ind[indcode[5:]] = indval.decode(enc)

            dfn = odict()
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

# TODO:
#for block_key, codes, fix_cfg in [('bib', [...], bfix_cfg), (...)]:
bib = out['bib']
for tagcode in ['000', '006', '007', '008']:
    fixmap = bib[tagcode]['fixmap'] = odict()
    for key, value in bfix_cfg.items(tagcode + 'Code'):
        tablelabel, tablename = value.split(',')
        tablename = tablename.strip()
        table = fixmap.setdefault(tablename, odict())
        table.setdefault('matchKeys', []).append(key)
        if tablelabel in rec_term_map:
            table['term'] = tablelabel
            table['matchRecTypeBibLevel'] = list(rec_term_map[tablelabel])
        else:
            table['label_sv'] = tablelabel.decode(enc)
        rows = table['rows'] = []
        for tablerow in bfix_cfg.options(tablename):
            cells = [s.strip() for s in tablerow.decode(enc).split(',')]
            label, enumkey, offset, length, default = cells
            row = odict()
            row['label_sv'] = label
            row['offset'] = int(offset)
            row['length'] = int(length)
            row['default'] = default
            if bfix_cfg.has_section(enumkey):
                row['keys'] = dict((k, v.decode(enc)) for k, v in bfix_cfg.items(enumkey))
            else:
                row['placeholder'] = enumkey
            rows.append(row)


json.dump(out, stdout, indent=2)

