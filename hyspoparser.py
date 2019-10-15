from bs4 import BeautifulSoup as bs

def hypso(file):
    a = open(file).read()
    bs1 = bs(a)
    txt = bs1.script.get_text()

    x = txt.find("dataX: [[")
    y = txt.find("]]")
    X = txt[x + 9:y]
    Xlist = X.split(",")
    N = []
    for x in Xlist:
        N.append(float(x))

    x = txt.find("dataY: [[")
    y = txt.find("]]", x)
    Y = txt[x + 9:y]
    Ylist = Y.split(",")
    N1 = []
    for y in Ylist:
        N1.append(float(y))

    return N,N1

def stat(file):
    a = open(file).read()
    soup = bs(a)
    table = soup.find("table")
    rows = table.findAll("td", {"class": "numberCell"})
    data = []
    for row in rows:
        data.append(float(row.get_text()))
    return data