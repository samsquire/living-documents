Installation
===

Let's focus efforts on standalone mode first or web based?

## Standalone


 * Clone the fact `library` somewhere central
 * Ask the user to pick a folder to save the user's data
 * Write a `settings.json`
 * Install some basic starting knowledgebases
 * There are two panes
 * Left hand side is challenge feed
 * Right hand side are events and facts that should be relevant to you
 
 * When a user enters an answer, the right pane side populates 
 	with useful information to do with the user's input,
 	that is, generated facts
 * Facts should not appear immediately
 * What about verbs, to act on my answers?
 * What about search? I can search my existing facts but this
 is likely to be small, the available knowledge is likely to
 be much bigger


Directory structure, each question answered will be put into a file on the file system, named after the challenge identifier. The challenge identifier is dash separated


repository/
    challenges/
        stock-purchase
        gross-annual-salary
        height
        weight
        date-of-birth
    config/
        settings.json
    knowledge/
        stock-values
        networth
        about-my-height
        

No file extensions

Challenges format:

type: stock-purchase
when:
questions:
    -   q: "What did you buy?"
        a: ""
    -   q: "What price did you buy at?"
        a: ""

A challenge can contain multiple questions.

We initially load all challenge objects and save them to the backend. We index questions by their name and key.

Knowledgebases depend on questions being answered to produce relevant output.

Knowledgebase output is in the same format as the challenge:

type: stock-values
questions:
    -   q: "What did you buy?"
        a: "APH.L"
     -  q: "How many units did you buy"
        a: "2000"
     -  q: "What is your current profit?"
        a: "£150"
     -  q: "What was your buying cost?"
        a: £1100"
     -  q: "What is the change percentage?"
        a: "16%"

Like a makefile decides which files to re-generate, the recency of the facts determines whether knowledge needs to be re-generated.

Q&A is great for generating forms and keeping them modifiable in a human readable format.

For computation and knowledge generation, the data can be converted into maps instead.

{
    "buyCost": "",
    "profit": ""   
}




Magic endpoint

# Online mode

In online mode, a knowledgebase can depend on knowledge that is volatile such as that changes based on time. Changes to facts will update the knowledge in real time.

# Offline mode

In offline mode, the living system acts like a static site generator and can only give a snapshop for static knowledge generation. This would only store things like averages.

Models:

Challenge -> a sequence of question objects
Fact -> An output from a knowledgebase,
	effectively a prefilled challenge

Filling a challenge writes a YAML file of a challenge

challenges/personal-income.yml

# Magic endpoint

# Interface

On open
Connect to instance
New

Action to HTTP request
Action to IPC event
Listen for action callback

# Accumulating facts

Far fewer features can be used locally because they
rely on dedicated databases and services 

* Opening a local repo, spiders all the facts
* Creates necessary event streams - temporal
* Daisy chains facts and knowledgebases

Some questions and answers become stale quickly



Sign into AWS MQTT
Communicate between instances

## Web - single tenant



## Standalone to multiple device


 * I have a standalone installation
 * I need to be able to run living documents on my mobile, tablet and other computers
 * How do I connect the different versions together?


# Model

Challenge -> Program -> Facts -> Program -> Challenge

# Script execution

I have a knowledgebase installed, such as UK Taxation.

UK Taxation depends on various pieces of information such as my gross salary and my net pay.

Create a dependency map data structure

Create event buses for each input
Wire up the event buses so they connect to relevant modules


Have a database of questions about purchased stocks

for all stock activity
	get pricing data for symbol
	calculate value
	calculate profit/loss amount and growth


```
{
	challenge: 'stock purchase'
	questions: [
	
	]	
}
```	

Now I want all stock purchases
filter('stock purchase')


