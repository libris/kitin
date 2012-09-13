import re
from collections import namedtuple, OrderedDict
from itertools import starmap
import csv


class Item(namedtuple('Item',
        "f1 f2 rectype field fieldname subfield position name comment entity"
        " description f5 f6 f7 f8 f9 f10 f11 f13 f14 f15 f16 f17 f18 f19")):
    pass


def get_items(fpath):
    with open(fpath, 'rb') as f:
        reader = csv.reader(f)
        for item in starmap(Item, reader):
            field = item.field
            fixmap = None
            if field == 'ldr':
                field = '000'
            elif field == 'dir':
                continue # TODO: ok? Directory is about low-level syntax parsning
            elif len(field) > 3 and field[3].isalpha():
                rectype = field[3:]
                rectype = {'Continuing': 'Serial',
                           'Electronic': 'Computer'}.get(rectype) or rectype
                field = field[0:3]
                fixmap = field + "_" + rectype
            item = item._replace(
                    field=field,
                    rectype=item.rectype.split('/'),
                    position=item.position if item.position != 'n/a' else None,
                    subfield=item.subfield if item.subfield != 'n/a' else None,
                    entity=re.sub(r'\?|\+[EA]\d+|^n/a$', '',
                        item.entity.replace('\x98', '')).title())
            item.fixmap = fixmap
            yield item

def dump_entities(items):
    entities = set(item.entity for item in items)
    for it in entities:
        if it:
            print it

def add_entities_to_marcmap(marcmap, items):
    for item in items:
        if not item.entity:
            continue
        if "BD" in item.rectype:
            recmap = marcmap['bib']
        #elif "HD" in item.rectype
        #    recmap = marcmap['holdings']
        else:
            continue
        field = recmap.get(item.field)
        if not field:
            print >>stderr, "Unknown field:", item.field
            continue
        if item.subfield:
            try:
                field['subfield'][item.subfield]['entity'] = item.entity
            except KeyError:
                print >>stderr, "Unknown field: {0.field}, subfield: {0.subfield}".format(item)
        elif item.position:
            # TODO: just guessing about 01 and 02
            if item.position == '01':
                field['ind1_entity'] = item.entity
            elif item.position == '02':
                field['ind2_entity'] = item.entity
            elif 'fixmaps' in field:
                if item.fixmap:
                    matchmap = item.fixmap.split('/')[0]
                else:
                    matchmap = '000_BibLeader'
                for fixmap in field['fixmaps']:
                    name = fixmap['name']
                    if name.endswith('s') and not matchmap.endswith('s'):
                        name = name[0:-1]
                    if name.startswith(matchmap):
                        break
                else:
                    print >>stderr, "Found no fixmap for field {0} matching {1} (entity: {2})".format(
                            item.field, matchmap, item.entity)
                # TODO: process fixmap columns
                print >>stderr, "Fixmap for", item.field, item.position, item.entity, "columns:", len(fixmap['columns'])
            else:
                field['entity'] = item.entity
        else:
            field['entity'] = item.entity


if __name__ == '__main__':
    from sys import argv, stdout, stderr
    frbrcsv_path = argv[1]
    marcmap_path = argv[2] if len(argv) > 2 else None

    # Use CSV from:
    #   <http://www.loc.gov/marc/marc-functional-analysis/source/FRBR_Web_Copy.txt>
    items = get_items(frbrcsv_path)

    if not marcmap_path:
        dump_entities(items)
    else:
        import json
        with open(marcmap_path) as f:
            marcmap = json.load(f, object_pairs_hook=OrderedDict)
        add_entities_to_marcmap(marcmap, items)
        json.dump(marcmap, stdout, indent=2)

