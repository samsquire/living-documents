import os, re
import plyvel
import json
from flask import Flask, Response, request, render_template
from flask.ext.cors import CORS
import subprocess
from subprocess import check_output
templates_folder=tmpl_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'templates')
app = Flask(__name__, template_folder=templates_folder)
CORS(app)

def open_db():
  return plyvel.DB('./db', create_if_missing=True)

open_db().close()

def save(path, thing, data):
  db = open_db() 
  countKey = b'count' + '-' + thing
  count = db.get(countKey) or str(1)
  data = data
  identifier = thing + '-' + count

  data["id"] = str(identifier)
  data["path"] = "/" + thing + 's/' + str(identifier)
  db.put(identifier, json.dumps(data))
  db.put(countKey, str(int(count) + 1))
  db.close()
  return data

@app.route("/challenges", methods=["POST"])
def save_challenge():
  newChallenge = save("/challenges/challenge-", b"challenge", request.get_json())
  return Response(json.dumps(newChallenge), content_type="application/json")

@app.route("/facts", methods=["POST"])
def save_fact():
  newFact = save("/facts/fact-", b"fact", request.get_json())
  return Response(json.dumps(newFact), content_type="application/json")

@app.route("/answers/<challengeId>")
def get_challenge(challengeId):
  db = open_db()
  challenge = db.get(b'challenge-' + str(challengeId)) 
  db.close() 
  if challenge is not None:
    data = json.loads(challenge)
    answer = data 
    return json.dumps(answer) 
  return Response(status=404)
   
@app.route("/challenges/<id>", methods=["POST"])
def update_challenge(id):
  db = open_db()
  identifier = str(id)
  response = {"status": "not updated"}
  if db.get(identifier) is not None:
    db.put(identifier, json.dumps(request.get_json()))
    response = {"status": "updated"}
  db.close()
  return json.dumps(response) 

def query(prefix):
  db = open_db()
  def generate():
    yield "["
    started = False
    query = db.iterator(prefix=prefix)
    for key, value in query:
      if started:
        yield ","
      data = json.loads(value)
      yield json.dumps(data)
      started = True
    query.close()
    db.close()
    yield "]"
  return generate

@app.route("/challenges")
def challenges():
  return Response(query(b'challenge-')(), mimetype="application/json")  


@app.route("/code", methods=["POST"])
def newCode():
  submission = request.get_json()
  code = submission["code"]  
  job = save("/jobs/job-", b"job", {})
  identifier = job["id"]
  file = open("jobs/" + identifier + ".js", "w")
  file.write(code)
  output = check_output(["node", "fact-executor.js", identifier], stderr=subprocess.STDOUT)  
  return Response(json.dumps({
    "output": output
  }), content_type="application/json")

@app.route("/facts", methods=["GET"])
def retrieve_facts():
  return Response(query(b'fact-')(), content_type="application/json")

def friendly_name(question_text):
  name = question_text.title().replace(" ", "").replace("?", "")
  return name[:1].lower() + name[1:]

@app.route("/usages/<language>", methods=["POST"])
def usages(language):

  dependencies = request.get_json()

  dependency_data = map(lambda i: {"name": friendly_name(i["question"]["question"]), "description":i["question"]["question"], "id": i[u"id"]}, dependencies)
  context = {
    "dependencies": dependency_data
  }

  if language in set(['javascript', 'ruby']):
    result = {
      'code': render_template(language + '.jinja', **context) 
    }
    return Response(json.dumps(result), content_type='application/json')
  else:
    return ""

if __name__ == "__main__":
    app.run(debug=True)
