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

driver = GraphDatabase.driver('bolt://localhost',auth=basic_auth("neo4j","&js2T(6~y3J!P$RhWWDo@~X"))

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

def serialize_movie(movie):
    return {
        'id': movie['id'],
        'title': movie['title'],
        'summary': movie['summary'],
        'released': movie['released'],
        'duration': movie['duration'],
        'rated': movie['rated'],
        'tagline': movie['tagline']
    }

def serialize_cast(cast):
    return {
        'name': cast[0],
        'job': cast[1],
        'role': cast[2]
    }

@app.route("/graph")
def get_graph():
    db = get_db()
    # OPTIONAL MATCH (m)-[r]->() 
    # RETURN m.name as name, m.tag as tag, m.ref as ref, labels(m) as label, TYPE(r) as type, m.date as nodeDate, r.date as relDate, r.name as relName
    # local ring:Algebraic geometry: 35GM6f8, local ring:Algebra: 35GM6f8
    #results = db.run("MATCH (n) RETURN n.uuid as uuid, n.name as name, labels(n) as labels"
             #"LIMIT {limit}", {"limit": request.args.get("limit", 100)})
    nodes = []
    for record in db.run("MATCH (n) RETURN n.uuid as uuid, n.name as name, labels(n) as labels"):
        nodes.append({"uuid": record["uuid"], "name": record["name"], "labels": record["labels"]})
    rels = []
    for record in db.run("MATCH (n)-[r]->(m) RETURN n.uuid as source, r.uuid as uuid, m.uuid as target, r.name as name, type(r) as type"):
        rels.append({"uuid": record["uuid"], "source": record["source"], "target": record["target"], "name": record["name"], "type": record["type"]})
    return Response(dumps({"nodes": nodes, "links": rels}),
                    mimetype="application/json")

@app.route("/search")
def get_search():
    try:
        q = request.args["q"]
    except KeyError:
        return []
    else:
        db = get_db()
        results = db.run("MATCH (movie:Movie) "
                 "WHERE movie.title =~ {title} "
                 "RETURN movie", {"title": "(?i).*" + q + ".*"}
        )
        return Response(dumps([serialize_movie(record['movie']) for record in results]),
                        mimetype="application/json")


@app.route("/movie/<title>")
def get_movie(title):
    db = get_db()
    results = db.run("MATCH (movie:Movie {title:{title}}) "
             "OPTIONAL MATCH (movie)<-[r]-(person:Person) "
             "RETURN movie.title as title,"
             "collect([person.name, "
             "         head(split(lower(type(r)), '_')), r.roles]) as cast "
             "LIMIT 1", {"title": title})

    result = results.single();
    return Response(dumps({"title": result['title'],
                           "cast": [serialize_cast(member)
                                    for member in result['cast']]}),
                    mimetype="application/json")


if __name__ == '__main__':
    app.run(port=8080)
