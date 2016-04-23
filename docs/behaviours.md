Installation
===

Let's focus efforts on standalone mode first or web based?

## Standalone


 * Clone the fact `library` somewhere central
 * Ask the user to pick a folder to save the user's data
 * Write a `settings.json`
 * Install some basic starting knowledgebases
 * Feed is displayed with questions
 * When a user enters an answer, the right pane side populates 
 	with useful information to do with the user's input,
 	that is, generated facts
 * What about verbs, to act on my answers?
 * What about search? I can search my existing facts but this
 is likely to be small, the available knowledge is likely to
 be much bigger

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


