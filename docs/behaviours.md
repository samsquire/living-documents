Installation
===

Let's focus efforts on standalone mode first or web based?

## Standalone


 * Clone the fact `library` somewhere central
 * Ask the user to pick a folder to save the user's data
 * Write a `settings.json`
 * Install some basic starting knowledgebases
 * 	

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

The UK Taxation knowledge base is script based and accepts JSON on stdin and emits JSON on stdout.

The script is always assumed to be named after the knowledgebase name?

If your script is a NPM module, ensure that it has a command line script?

Or when imported exposes a `extractChallenges` method and `executeFacts` method.

```
var ukTax = require('uk-tax);
	ukTax.getChallenges();
	ukTax.executeFacts(requestedKnowledge);
```




