# Blog-Site example

Demonstrates how to use the dog provider in order to serve the blog via a website.

## Disclaimer

Please keep in mind that I favored simplicity over correctness and robustness.

I used shorter (and somewhat naive) implementations and avoided using libraries to let this example stand on its own.

## Improvements needed

The following should be improved if this was to be used for real:

- implement a more robust router or use libraries like director or express
- the server and blog initialization need more robust error handling
- the code should be modularized

## Running the example

Alright, enough of the warnings, here is how you run the example:

After you installed **dog** via: `npm install dog`, do the following:

    npm explore dog
    npm run-script example-site
