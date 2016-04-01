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

def save(path, thing, data, count=True):
  db = open_db()
  identifier = thing
  if count:
    countKey = b'counts-' + path
    count = db.get(countKey) or str(1)
    identifier = thing + '-' + count

  data["id"] = str(identifier)
  if count:
    data["path"] = "/" + thing + 's/' + str(identifier)
  db.put(identifier, json.dumps(data))
  print("Just saved " + thing + " as " + json.dumps(data))
  if count:
    db.put(countKey, str(int(count) + 1))
  db.close()
  return data

def update_thing(thingType, identifier, data):
  db = open_db()
  response = {"status": "not updated"}
  if db.get(identifier) is not None:
    print("Just updated  " + thingType + " as " + identifier)
    db.put(identifier, json.dumps(request.get_json()))
    response = {"status": "updated"}
  db.close()
  return response

  
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

def update_questions(questions):
  db = open_db()
  for question in questions:
    identifier = str(question["question"])
    questionData = db.get(identifier)

    if questionData:
      data = json.loads(questionData)
    else:
      data = {} 
    data.update(question)
    db.close()
    save("/questions/question-", identifier, data, count=False)
  db.close()

@app.route("/search/", methods=["GET"])
def search():
  return json.dumps({
    "results": [ 
      {"title": "I like"},
      {"title": "I like"},
  ]})  

@app.route("/challenges", methods=["POST"])
def save_challenge():
  challenge = request.get_json()
  job = challenge.get("job")
  newChallenge = save("/challenges/challenge-", b"challenge", challenge)
  update_questions(newChallenge["questions"])
  if job:
    add_job_to_questions(job, newChallenge["questions"])
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

   
@app.route("/challenges/<challengeId>", methods=["POST"])
def update_challenge(challengeId):
  challenge = request.get_json()
  update_questions(challenge["questions"])
  response = json.dumps(update_thing('challenge', bytes(challengeId), challenge))
  for question in challenge["questions"]: 
    print("looking at updated question")
    questionText = str(question["question"])
    print(questionText)
    db = open_db()
    rawQuestion = db.get(questionText)
    db.close()
    if rawQuestion:
      questionData = json.loads(rawQuestion)    
      print(questionData)
      db = open_db()
      jobs = questionData.get("jobs")
      db.close()
      if jobs: 
        for job in jobs:
          print(questionText + " has dependency on " + job)
          run_job(job)
  return response 


@app.route("/challenges")
def challenges():
  return Response(query(b'challenge-')(), mimetype="application/json")  

def run_job(identifier):
  process = subprocess.Popen(["node", "fact-executor.js", identifier])

def add_job_to_questions(job, dependencies):
  db = open_db()     
  for dependency in dependencies:
    text = dependency["question"]
    print("encountered a dependency on question " + text)
    question = db.get(str(text))
    if question:
      questionData = json.loads(question)  
      questionData["jobs"] = questionData.get("jobs", [])
      questionData["jobs"].append(job)
      print(questionData)
      db.put(str(text), json.dumps(questionData))
  db.close()


@app.route("/code", methods=["POST"])
def newCode():
  submission = request.get_json()
  code = submission["code"]  
  dependencies = submission["dependencies"]
  job = save("/jobs/job-", b"job", {})
  identifier = job["id"]
  add_job_to_questions(identifier, map(lambda item: item["question"], dependencies))
  with open("jobs/" + identifier + ".js", "w") as file:
    file.write(code)

  run_job(identifier)
  
  return Response(json.dumps({
    "output": "executed",
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
    app.run(debug=True, threaded=True)
