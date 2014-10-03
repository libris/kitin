from jinja2 import Template


template = Template("{{familyName}}{%if familyName and givenName%}, {%endif%}{{givenName}}{%if numeration%} ({{numeration}}){%endif%}{%if personTitle%}, {{personTitle}}{%endif%}{%if birthYear or deathYear%}, {{birthYear}}-{{deathYear}}{%endif%}")

def test(expected, **kwargs):
    result = template.render(**kwargs)
    assert expected == result, "Result was: %s" % result


test("Jansson, Tove (VI), Esq., 1914-2001", familyName="Jansson", givenName="Tove", numeration="VI", personTitle="Esq.", birthYear="1914", deathYear="2001")

test("Jansson, Tove (VI), 1914-2001", familyName="Jansson", givenName="Tove", numeration="VI", birthYear="1914", deathYear="2001", )

test("Jansson, Tove, Esq., 1914-2001", familyName="Jansson", givenName="Tove", personTitle="Esq.", birthYear="1914", deathYear="2001")

test("Jansson, Tove, 1914-2001", familyName="Jansson", givenName="Tove", birthYear="1914", deathYear="2001")

test("Jansson, Tove, 1914-", familyName="Jansson", givenName="Tove", birthYear="1914")

test("Tove, 1914-", givenName="Tove", birthYear="1914")

test("Jansson, 1914-", familyName="Jansson", birthYear="1914")

test("Jansson, -2001", familyName="Jansson", deathYear="2001")

test("Jansson, Tove", familyName="Jansson", givenName="Tove")

