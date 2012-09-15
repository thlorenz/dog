# dog [![Build Status](https://secure.travis-ci.org/thlorenz/dog.png)](http://travis-ci.org/thlorenz/dog) 
## D *eveloper bl* OG

  - markdown based
  - code snippet support
  - syntax highlighting
  - posts stored on file system 
  - provides html and default styles
  - publishes via simple command line

![cat](https://github.com/thlorenz/dog/raw/master/assets/cat.png)

## Status
  
  - fully functional
  - not documented and tried yet, as I am currently 'dog fooding it' (npi) while building my [website](https://github.com/thlorenz/thlorenz.com)  in
    order to flesh out what exactly to expose as public api and also document
  - at this point be welcome to use it if you don't need documentation

## Installation

As a commandline tool in order to maintain, publish, etc., your blog:
    
    npm install -g dog

Inside the application that uses **dog** to provide your blog:

    npm install dog

## Scaffold Your Blog

To get your blog started create a directory where you want your blog to live `cd` into it and then do:
  
    dog scaffold

This will create the folder structure including styles and an introductory post.

You should preview that post in order to learn more about **dog**.

## Examples

Please consult the [blog-only](https://github.com/thlorenz/dog/tree/master/examples/blog-only) and the [blog-site](https://github.com/thlorenz/dog/tree/master/examples/blog-site)
examples in order to get an idea on how to use dog.
