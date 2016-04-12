Installation
===

Let's focus efforts on standalone mode first or web based?

## Standalone


 * Clone the fact `library` somewhere central
 * Ask the user to pick a folder to save the user's data
 * Write a `settings.json`
 * Install some basic starting knowledgebases



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


