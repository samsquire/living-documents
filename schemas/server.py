import plyvel
import json
from flask import Flask, Response, request
from flask.ext.cors import CORS
app = Flask(__name__)
CORS(app)

@app.route("/challenges", methods=["POST"])
def save_challenge():
  db = plyvel.DB('./db', create_if_missing=True)
  count = db.get(b'count') or str(1)
  newChallenge = request.get_json()
  identifier = b'challenge-' + count
  newChallenge["id"] = str(identifier)
  newChallenge["path"] = "/challenges/challenge-" + str(identifier)
  db.put(identifier, json.dumps(newChallenge))
  db.put(b'count', str(int(count) + 1))
  db.close()
  return Response(json.dumps(newChallenge), content_type="application/json")

@app.route("/answers/<challengeId>")
def get_challenge(challengeId):
  db = plyvel.DB('./db', create_if_missing=True)
  challenge = db.get(b'challenge-' + str(challengeId)) 
  db.close() 
  if challenge is not None:
    data = json.loads(challenge)
    answer = data 
    return json.dumps(answer) 
  return Response(status=404)
   
@app.route("/challenges/<challengeId>", methods=["POST"])
def update_challenge(challengeId):
  db = plyvel.DB('./db', create_if_missing=True)
  identifier = str(challengeId)
  response = {"status": "not updated"}
  if db.get(identifier) is not None:
    db.put(identifier, json.dumps(request.get_json()))
    response = {"status": "updated"}
  db.close()
  return json.dumps(response) 

@app.route("/challenges")
def challenges():
  db = plyvel.DB('./db', create_if_missing=True)
  def generate():
    yield "["
    started = False
    query = db.iterator(prefix=b'challenge-')
    for key, value in query:
      if started:
        yield ","
      data = json.loads(value)
      yield json.dumps(data)
      started = True
    query.close()
    db.close()
    yield "]"
  return Response(generate(), mimetype="application/json")  

if __name__ == "__main__":
    app.run(debug=True)
