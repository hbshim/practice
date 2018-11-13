#!/usr/bin/env python
import os
from json import dumps
from flask import Flask, g, Response, request, render_template

from neo4j import GraphDatabase, basic_auth

app = Flask(__name__, static_url_path='/static/')
#app = Flask(__name__, static_url_path='/')
# Set debug mode
app.debug = True

#password = os.getenv("NEO4J_PASSWORD")

driver = GraphDatabase.driver(
    'bolt://localhost', auth=basic_auth("neo4j", "&js2T(6~y3J!P$RhWWDo@~X"))


def get_db():
    if not hasattr(g, 'neo4j_db'):
        g.neo4j_db = driver.session()
    return g.neo4j_db


@app.teardown_appcontext
def close_db(error):
    if hasattr(g, 'neo4j_db'):
        g.neo4j_db.close()


@app.route("/")
def get_index():
    return render_template('index.html')


def serialize_result(n):
    return {
        'name': n['name'],
        'label': n['summary'],
        'released': n['released'],
        'duration': n['duration'],
        'rated': n['rated'],
        'tagline': n['tagline']
    }


def serialize_cast(cast):
    return {'name': cast[0], 'job': cast[1], 'role': cast[2]}


@app.route("/graph")
def get_graph():
    db = get_db()
    # OPTIONAL MATCH (m)-[r]->()
    # RETURN m.name as name, m.tag as tag, m.ref as ref, labels(m) as label, TYPE(r) as type, m.date as nodeDate, r.date as relDate, r.name as relName
    # local ring:Algebraic geometry: 35GM6f8, local ring:Algebra: 35GM6f8
    #results = db.run("MATCH (n) RETURN n.uuid as uuid, n.name as name, labels(n) as labels"
    #"LIMIT {limit}", {"limit": request.args.get("limit", 100)})
    nodes = []
    for record in db.run(
            "MATCH (n) RETURN n.uuid as uuid, n.name as name, labels(n) as labels"
    ):
        nodes.append({
            "uuid": record["uuid"],
            "name": record["name"],
            "labels": record["labels"]
        })
    rels = []
    for record in db.run(
            "MATCH (n)-[r]->(m) RETURN n.uuid as source, r.uuid as uuid, m.uuid as target, r.name as name, type(r) as type"
    ):
        rels.append({
            "uuid": record["uuid"],
            "source": record["source"],
            "target": record["target"],
            "name": record["name"],
            "type": record["type"]
        })
    return Response(
        dumps({
            "nodes": nodes,
            "links": rels
        }), mimetype="application/json")


@app.route("/search")
def get_search():
    try:
        q = request.args["q"]
    except KeyError:
        return []
    else:
        db = get_db()
        nodes = []
    for record in db.run(
            "MATCH (n {name:{name}}) RETURN n.uuid as uuid, n.name as name, labels(n) as labels",
        {"name": q}):
        nodes.append({
            "uuid": record["uuid"],
            "name": record["name"],
            "labels": record["labels"]
        })
    #result = results.single()
    return Response(dumps({"nodes": nodes}), mimetype="application/json")


@app.route("/node/<uuid>")
def get_item(uuid):
    db = get_db()
    nodes = []
    for record in db.run(
            "MATCH (n {uuid:{uuid}}) RETURN n.uuid as uuid, n.name as name, labels(n) as labels",
        {"uuid": uuid}):
        nodes.append({
            "uuid": record["uuid"],
            "name": record["name"],
            "labels": record["labels"]
        })
    #result = results.single()
    return Response(dumps({"nodes": nodes}), mimetype="application/json")

@app.route('/editor')
def editor():
    return render_template('editor.html')


if __name__ == '__main__':
    app.run(port=8080)
