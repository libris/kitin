import re
from collections import namedtuple
from itertools import starmap
import csv


Item = namedtuple('Item',
        "f1 f2 rectype field fieldname subfield position name comment entity"
        " description f5 f6 f7 f8 f9 f10 f11 f13 f14 f15 f16 f17 f18 f19")


def get_items(fpath):
    with open(fpath, 'rb') as f:
        reader = csv.reader(f)
        for item in starmap(Item, reader):
            field = {'ldr': '000', 'dir': 'dir?'}.get(item.field) or item.field
            item = item._replace(
                    field=field,
                    rectype=item.rectype.split('/'),
                    subfield=item.subfield if item.subfield != 'n/a' else None,
                    entity=re.sub(r'\?|\+[EA]\d+|^n/a$', '',
                        item.entity.replace('\x98', '')).title())
            yield item

def dump_entities(items):
    entities = set(item.entity for item in items)
    for it in entities:
        if it:
            print it

def add_entities_to_marcmap(marcmap, items):
    for item in items:
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
                print >>stderr, "Unknown field, subfield:", item.field, item.subfield


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
            marcmap = json.load(f)
        add_entities_to_marcmap(marcmap, items)
        json.dump(marcmap, stdout, indent=2)

