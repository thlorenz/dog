# dog [![Build Status](https://secure.travis-ci.org/thlorenz/dog.png)](http://travis-ci.org/thlorenz/dog) 
## D *eveloper bl* OG

  - markdown based
  - code snippet support
  - syntax highlighting
  - posts stored on file system 
  - provides html and default styles
  - publishes via simple command line

![cat](https://github.com/thlorenz/dog/raw/master/assets/cat.png)

## Installing Dog

In order to install dog globally to us it as a command line tool to manage your blog do:

`npm install -g dog` 

In order to use dog's providing capabilities in order to serve your blog, install it locally to the project, i.e.,: 

`npm install dog`

## Dog Command Line

dog allows you to manage your blog via simple a simple command line interface.

The commands follow a general pattern: `dog <action> <post> [options]`

The <post> here is the directory that contains the post (i.e., 'post.md') on which the action is to be performed.

In only a few cases (i.e., when the action affects the entire blog) the <post> is omitted.

All of the actions assume that you created a blog directory and are currently in it.

Lets run through the different actions one by one.

### scaffold

`dog scaffold`

Creates a blog skeleton including a sample post.

This is probably the first thing you want to do in order to start your blog.

### preview

`dog preview post`

Opens the rendered post in the browser. 

### publish

`dog publish post [options]`

Publishes the post according to the given options.

Options:

- `--title`: The title to be applied to the post.
- `--tags`: The tags that will be added to the post
- `--root`: The root directory of your blog. Defaults to `./`, so you don't need it if you are executing this action
  from the blog root.

This will add or update `post.json` inside the post directory as well as add it and its tags to `blog.json`.

dog will print out a record of the changes made.

If you publish an existing post again, only the updated date and any given options will be changed. Everything else will stay as before.

**Example:** `dog publish getting-started --title "Getting started with dog" --tags "cli nodejs javascript"

### unpublish

`dog unpublish post`

This will remove the given post from the `blog.json` and delete the `post.json` from the post directory. Anything else in the post's directory will be left untouched.

### summary

`dog summary`

Prints out a summary of your blog, including all metadata of each published post and important directories, e.g., `assets` and `images`.

### help

`dog help`

Prints out dog help.

### includeStyles

`dog includeStyles --styles "style1 style2 ..."`

Configures the blog provider to include the given styles from the `assets/styles` directory.

Most likely you will not need to change the default.

### action aliases

dog understands unambiguous short forms of action names in a similar way that nodejs's npm does.

Therefore `dog pub post` gets expanded to `dog publish post` while `dog s` is not sufficient since it could mean `dog summary` or `dog scaffold`.

As a less useful option, `dog --action publish --post post --title "My Post"` is equivalent to `dog publish post --title "My Post"`.

## Dog Provider



## Examples

Please consult the [blog-only](https://github.com/thlorenz/dog/tree/master/examples/blog-only) and the [blog-site](https://github.com/thlorenz/dog/tree/master/examples/blog-site)
examples in order to get an idea on how to use dog.
