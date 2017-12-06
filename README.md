# Summary
CorvoStore is an in-memory, key-value store with optional persistence, written in a NodeJS context. It is an experimental project inspired by Redis. CorvoStore supports five data types in the value space: strings, lists, hashes, sets, and sorted sets.

CorvoStore uses the TCP protocol provided by Node’s Net module to facilitate communication between clients and a server.

Key-value stores are a subset of NoSQL databases. NoSQL databases in general are more performant than relational databases. Retrieving data from relational databases can be an expensive operation since the schema, or structure, of the data needs to be maintained. Key-value stores are useful for cases where data does not have a predefined structure.

# Features
## Overview

Here is a brief overview of CorvoStore’s data flow:

 - server receives a RESP-formatted command from client,
 - server passes the command to the parser for validation,
 - parser validates command and returns array of tokens,
 - server invokes a method in the store corresponding to the command, passing tokens as arguments,
 - server encodes return value from store method into RESP format and writes this back to the client,
 - client decodes value returned by server.

## LRU Eviction

CorvoStore allows you to specify the maximum allowable memory for the key-value store, and evicts the least recently used key if the max memory is exceeded.
## Multiple data types
You can store complex data types in the key-value store.
## Persistence
CorvoStore optionally supports AOF (append-only file) persistence. Write operations that modify data are logged to a file, and the file is used to reconstruct the dataset when the server is started.   

# Installation
## Installing the NPM Module with the Command Line

Install the module with the following command:

`$ npm install corvoserver`

Then, navigate to the following directory:

`cd ~/node_modues/corvoserver`

And then make sure to execute the following command:

`$ npm install`

After installation is complete, execute the following command:

`$ npm start`

Now, the server is listening on localhost:6793!
