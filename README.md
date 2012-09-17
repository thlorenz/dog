**Table of Contents**  *generated with [DocToc](http://doctoc.herokuapp.com/)*


# dog [![Build Status](https://secure.travis-ci.org/thlorenz/dog.png)](http://travis-ci.org/thlorenz/dog) 

## D *eveloper bl* OG

  - markdown based
  - code snippet support
  - syntax highlighting
  - posts stored on file system 
  - provides html and default styles
  - publishes via simple command line

![cat](https://github.com/thlorenz/dog/raw/master/assets/cat.png)

- [Installing Dog](#installing-dog)
- [Dog Command Line](#dog-command-line)
  - [scaffold](#scaffold)
  - [preview](#preview)
  - [publish](#publish)
  - [unpublish](#unpublish)
  - [summary](#summary)
  - [help](#help)
  - [includeStyles](#includestyles)
  - [action aliases](#action-aliases)
- [Dog Metatags](#dog-metatags)
  - [Including Post Title](#including-post-title)
  - [Including Post Creation Date](#including-post-creation-date)
  - [Including Post Update Date](#including-post-update-date)
  - [Including Post Tags](#including-post-tags)
  - [Including external Code Snippets](#including-external-code-snippets)
- [Dog Provider](#dog-provider)
  - [provideFrom](#providefrom)
  - [concatentateStyles](#concatentatestyles)
  - [provideAll](#provideall)
  - [provideUpdatedSince](#provideupdatedsince)
  - [copyImages](#copyimages)
  - [getAllPosts](#getallposts)
  - [getAllTags](#getalltags)
  - [getPostMetadata](#getpostmetadata)
  - [getPostHtml](#getposthtml)
  - [blog directories](#blog-directories)
  - [getStylesFiles](#getstylesfiles)
  - [printSummary](#printsummary)
- [Styling](#styling)
- [Examples](#examples)
  - [Blog Only](#blog-only)
  - [Blog Site](#blog-site)

## Installing Dog

In order to install dog globally to use its command line tool to manage your blog do:

`npm install -g dog` 

In order to use dog's providing capabilities in order to serve your blog, install it locally to the project, i.e.,: 

`npm install dog`

## Dog Command Line

dog allows you to manage your blog via simple a simple command line interface.

The commands follow a general pattern: `dog <action> <post> [options]`

The `<post>` here is the directory that contains the 'post.md' on which the action is to be performed.

In only a few cases (i.e., when the action affects the entire blog) `<post>` is omitted.

All of the actions assume that you created a blog directory and are currently in it unless you specify the `--root`
options (see below).

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

If you publish an existing post again, only the updated date and any given options will be changed. Everything else will
stay as before.

**Example:** `dog publish getting-started --title "Getting started with dog" --tags "cli nodejs javascript"

### unpublish

`dog unpublish post`

This will remove the given post from the `blog.json` and delete the `post.json` from the post directory. Anything else
in the post's directory will be left untouched.

### summary

`dog summary`

Prints out a summary of your blog, including all metadata of each published post and important directories, e.g.,
`assets` and `images`.

### help

`dog help`

Prints out dog's help message.

### includeStyles

`dog includeStyles --styles "style1 style2 ..."`

Configures the blog provider to include the given styles from the `assets/styles` directory.

Most likely you will not need to change the default.

### action aliases

dog understands unambiguous short forms of action names in a similar way that nodejs's npm does.

Therefore `dog pub post` gets expanded to `dog publish post` while `dog s` is not sufficient since it could mean `dog
summary` or `dog scaffold`.

As a less useful option:
`dog --action publish --post post --title "My Post"` is equivalent to `dog publish post --title "My Post"`.

## Dog Metatags

Aside from the usual markdown directives dog supports a few more tags enclosed by `{{ }}` in order to include metadata
or external snippets.

Studying the 'getting-started' post included as a result of `dog scaffold` and comparing it to the rendered html - `dog
preview getting-started` should give you a good idea on how this works.

### Including Post Title

`{{ meta: title }}`

Will be replaced with the title found inside `post.json`.

### Including Post Creation Date

`{{ meta: created }}`

Will be replaced with the created date found inside `post.json`.

Additionally a `.created` css selector is applied to it to allow proper styling.

### Including Post Update Date

`{{ meta: updated }}`

Will be replaced with the updated date found inside `post.json`.

Additionally a `.updated` css selector is applied to it to allow proper styling.

### Including Post Tags

`{{ meta: tags }}`

Will be replaced with the tags found inside `post.json`.

Additionally a `.tags` css selector is applied to it to allow proper styling.

### Including external Code Snippets

`{{ snippet: name }}`

Will be replaced with the content of the file `name` found inside the `snippets` directory inside the posts directory.

**Example:**

Assume we have a post named mypost. Inside `./mypost` we created a `snippets` folder into which we copied `myscript.js`.

We can now include that in `./mypost/post.md` via `{{ snippet: myscript.js }}`.

## Dog Provider

The dog provider assists you in serving your blog from a website.

It offers a number of functions to that purpose. Althoug all of them are explained here, you most likely will only need
the first four.

All mentioned callbacks have this signature: `function (err, result) { ... }`.

The below explanations assume that you required dog in your module via `var dog = require('dog');`.

### provideFrom

`dog.provider.provideFrom(fullPathToBlog)`

Call this before using any of the other provider functions to tell the provider in which directory your blog lives
(i.e., where the `blog.json` file is found).

### concatentateStyles

`dog.provider.concatenateStyles(callback)`

Concatenates all styles from `assets/styles` is is configured to include (see [includeStyles](#includestyles)) and calls
back with the resulting css.

### provideAll

`dog.provider.provideAll(callback)`

Gathers metadata of all posts that were published to your blog and attaches rendered html. Calls back with the result.

**Example Result:**

```
[ 
  { name: 'my-first-post',
     metadata: 
      { created: Sun Sep 16 2012 11:54:37 GMT-0400 (EDT),
        updated: Sun Sep 16 2012 16:42:37 GMT-0400 (EDT),
        tags: ['tag1', tag2'],
        name: 'my-first-post',
        title: 'Getting started' },
     html: { ... } 
  },
  { name: 'my-second-post',
     metadata: 
      { created: Sun Sep 17 2012 11:54:37 GMT-0400 (EDT),
        updated: Sun Sep 17 2012 16:42:37 GMT-0400 (EDT),
        tags: ['tag2', tag3'],
        name: 'my-second-post',
        title: 'Getting started again' },
     html: { ... } 
  }
]
```

### provideUpdatedSince

`dog.provider.provideUpdatedSince (when, callback)`

Same as [provideAll](#provideall) except only posts updated since `when`, which is a `Date` object, are included.

### copyImages

`dog.copyImages(fullPath, callback)`

Copies all images found inside your blog (i.e., in `assets/images`) to the `fullPath` given.

Calls back with an error if it failed or null if successfull.

### getAllPosts

`dog.provider.getAllPosts(callback)`

Calls back with a string array containing names of all posts that were published to your blog.

### getAllTags

`dog.provider.getAllTags`

Calls back with a string array containing all tags found in any of the posts that were published to your blog.

### getPostMetadata

`dog.provider.getPostMetadata(postName, callback)`

Calls back with metadata of the given post.

**Example Result:**

```
{ created: Sun Sep 16 2012 11:54:37 GMT-0400 (EDT),
  updated: Sun Sep 16 2012 16:42:37 GMT-0400 (EDT),
  tags: [ 'dog', 'tutorial', 'nodejs' ],
  name: 'dog-tutorial',
  title: 'Getting started with dog' }
```

### getPostHtml

`dog.provider.getPostHtml(postName, callback)`

Calls back with the rendered html of the given post.

### blog directories

Various functions return full paths to important directories inside your blog. 

These are:

`dog.provider.getAssetsDir()`

`dog.provider.getImagesDir()`

`dog.provider.getStylesDir()`

### getStylesFiles

`dog.provider.getStylesFiles(callback)`

Calls back with a list of full paths of all styles included in your blog.

### printSummary

`dog.provider.printSummary`

Prints out a summary of your blog, including importand directories and published posts.

## Styling

Aside from including styles targeting `.blog-post` inside your sites styles file, you can also edit the styles included
with your blog inside `assets/styles`.

You also can include additional styles by dropping them into that folder and including them in your blog via
[includeStyles](#includestyles).

The `code.css` style is a [SyntaxHighlighter](http://alexgorbatchev.com/SyntaxHighlighter) theme and can be replaced
with any of the themes found [here](http://alexgorbatchev.com/SyntaxHighlighter/manual/themes/).

This will change the looks of your syntax highlighted code.

You may have to edit `code-fixes.css` as well in that case, since the styles in there are closely related.

## Examples

### Blog Only

Look at and play with [blog-only](https://github.com/thlorenz/dog/tree/master/examples/blog-only) to understand
better how to manage your blog and/or preview posts.

### Blog Site

Look at [blog-site](https://github.com/thlorenz/dog/tree/master/examples/blog-site) in order to get an idea on how to
use dog to provide your blog from a website.

