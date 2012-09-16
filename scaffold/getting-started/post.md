# {{ meta: title }}

{{ meta: created }}
{{ meta: tags }}

Dog is a markdown based blogging engine, powered by:

[![nodejs](assets/images/nodejs.png)](http://nodejs.org/)

This post will give a quick introduction on dog and why I wrote it, followed by a tutorial on how to create, publish and
then serve your own blog with it.

## Why I created another blogging Engine

I created dog in order to quickly share software related ideas, insights, etc.,. via a blog powered by
[nodejs](http://nodejs.org/).

In order to support that goal it needed to have the following features:

1. powered by nodejs
2. markdown based
3. intuitive command line interface to preview and publish posts
4. simple api to provide the rendered html for each post so I can serve it however I want 
5. first class code snippet support to allow:
    - inlined snippets
    - snippets pulled in from external files on the fly
    - syntax highlighting
6. meta tag support to pull in the following information:
    - post title
    - post tags
    - created and updated dates
7. simple to use command line for:
    - previewing post
    - publishing post with title and tags information
8. easily stylable

I searched for an existing engine with these features before creating my own.

I looked into [wheat](https://github.com/creationix/wheat), [blogit](https://github.com/dshaw/blogit) and lots of
others.

Most of them included a server and there seemed to be no easy way to otherwise provide the rendered html pages. Since my
blog is part of my website which itself is already served, that was a dealbreaker to me.

On the bright side I learned a lot by reading through the code of other blog engines and dog definitely was heavily
inspired by them, especially the two mentioned above.

## Getting started with dog

Enough preamble, lets launch into the tutorial which will teach you everything you need to know to create and serve your
blog!

The blog resulting from this tutorial is [available on github](https://github.com/thlorenz/dog-example-getting-started).

### Installing dog

In the beginning we will use dog as a command line tool to preview and publish our blog, so we need to install it
globally using **npm** which is available as part of the [nodejs installer](http://nodejs.org/#download).

```sh
➝  npm install -g dog
npm http GET https://registry.npmjs.org/dog
[ .. ]
npm http 304 https://registry.npmjs.org/wordwrap
/usr/local/bin/dog -> /usr/local/lib/node_modules/dog/index.js
dog@0.0.11 /usr/local/lib/node_modules/dog
├── ap@0.1.0
├── dateformat@1.0.2-1.2.3
├── runnel@0.0.5
├── marked@0.2.5
├── node-syntaxhighlighter@0.8.1
├── npmlog@0.0.2 (ansi@0.1.2)
└── optimist@0.3.4 (wordwrap@0.0.2)
```

### Scaffolding your Blog

After the install is complete, create and navigate to the directory you want your blog to live in and use dog's
scaffolder to get your blog started.

```sh
➝  mkdir getting-started
➝  cd getting-started
➝  dog scaffold
info scaffolder Creating directories:
info scaffolder mkdir assets
info scaffolder mkdir assets/images
info scaffolder mkdir assets/styles
info scaffolder mkdir getting-started
info scaffolder Copying images
info scaffolder Copying styles
info scaffolder Copying introductory post
info scaffolder Your Developer blOG is now set up and contains an introductory post "getting-started".
info scaffolder You can preview it by typing:   dog preview getting-started
info scaffolder You can publish it by typing:   dog publish getting-started -t "Getting Started" -g "dog cli nodejs"
info scaffolder You can unpublish it by typing: dog unpublish getting-started
info scaffolder Happy blogging!
```

This sets up your blog including an introductory post with the following folder/file structure:

```text
.
├── assets
│   ├── images
│   │   └── nodejs.png
│   └── styles
│       ├── blog.css
│       ├── code-fixes.css
│       ├── code.css
│       └── preview.css
└── getting-started
    └── post.md
```

**Note:** all posts have one markdown file which has to be called 'post.md' since that is how dog expects it. The folder
name is enough to separate the posts by name.

### Previewing and Publishing a Post

As the scaffolder message tells you, you can now preview the 'getting-started' post.

Typing `dog preview getting-started` will open that post in the browser.

Note the "Unknown until published" indicating that the post is still untitled and has no tags.

In order to serve the post as part of your blog however, you need to publish it:

```sh
➝  dog publish getting-started --title "Getting Started" --tags "dog cli nodejs"
info publisher Created/Updated Post Metadata: {
info publisher   "created": "2012-09-15T20:25:23.939Z",
info publisher   "updated": "2012-09-15T20:25:23.939Z",
info publisher   "tags": [
info publisher     "dog",
info publisher     "cli",
info publisher     "nodejs"
info publisher   ],
info publisher   "name": "getting-started",
info publisher   "title": "Getting Started"
info publisher }
info publisher Created/Updated Blog Metadata: {
info publisher   "posts": [
info publisher     "getting-started"
info publisher   ],
info publisher   "tags": [
info publisher     "dog",
info publisher     "cli",
info publisher     "nodejs"
info publisher   ],
info publisher   "styles": [
info publisher     "code",
info publisher     "code-fixes",
info publisher     "blog"
info publisher   ]
info publisher }
info publisher Post getting-started successfully published/updated
```
The output tells you exactly what actions were performed and how your blog was updated.

Your blog now has the following structure:

```shell
.
├── assets
│   ├── images
│   │   └── nodejs.png
│   └── styles
│       ├── blog.css
│       ├── code-fixes.css
│       ├── code.css
│       └── preview.css
├── blog.json
└── getting-started
    ├── post.json
    └── post.md
```

Two new files where created: `post.json` and `blog.json`. 

The former contains metadata about the 'getting-started' post, while the latter maintains the state of your entire blog.

You can republish the same post multiple times. Only the "updated" date and anything else you supply will be changed.
Everything else will remain the same. 

Lets update the title of our post:

```sh
➝  dog publish getting-started --title "Getting Started Now"
info publisher Created/Updated Post Metadata: {
info publisher   "created": "2012-09-15T20:25:23.939Z",
info publisher   "updated": "2012-09-15T20:58:23.776Z",
info publisher   "tags": [
info publisher     "dog",
info publisher     "cli",
info publisher     "nodejs"
info publisher   ],
info publisher   "name": "getting-started",
info publisher   "title": "Getting Started Now"
info publisher }
info publisher Created/Updated Blog Metadata: {
info publisher   "posts": [
info publisher     "getting-started"
info publisher   ],
info publisher   "tags": [
info publisher     "dog",
info publisher     "cli",
info publisher     "nodejs"
info publisher   ],
info publisher   "styles": [
info publisher     "code",
info publisher     "code-fixes",
info publisher     "blog"
info publisher   ]
info publisher }
info publisher Post getting-started successfully published/updated
```
As you can see, while the title was updated, the tags were left unchanged.

This concludes the section on using dog's command line in order to manage your blog.

If you want to see what other actions and options are available you can find out via dog's help action:

```text
➝  dog help
dog <action> <post> [options]

Options:
  -a, --action  One of the following: scaffold, preview, publish, unpublish, summary, includeStyles, help
  -p, --post    The directory in which the post resides inside the blog directory                        
  -r, --root    The root directory of your blog e.g., the one that contains blog.json                      [default: "./"]
  -t, --title   The title to give to the post                                                            
  -g, --tags    Tags which should be applied to the post                                                 
  -s, --styles  Styles (without ".css" extension) to be included when the blog is provided                 [default: "code code-fixes blog"]
```

***

### Providing your blog via a website

Dog just provides post metadata and its rendered html, so you are most flexible to choose how you serve it up.

I'm going to demonstrate in a simplified example how to leverage the dog provider features in order to serve your blog
on a website.

Although we will be using [director](https://github.com/flatiron/director) in this example, you could use any module or
web framework like [express](http://expressjs.com/) to route your requests.

First lets install director and dog both locally:

```sh
➝  npm install director
npm http GET https://registry.npmjs.org/director
npm http 304 https://registry.npmjs.org/director
director@1.1.6 node_modules/director
```

```sh
➝  npm install dog
npm http GET https://registry.npmjs.org/dog
npm http 304 https://registry.npmjs.org/dog
[ .. ]
npm http 304 https://registry.npmjs.org/wordwrap
dog@0.0.12 node_modules/dog
├── ap@0.1.0
├── dateformat@1.0.2-1.2.3
├── runnel@0.0.5
├── marked@0.2.5
├── node-syntaxhighlighter@0.8.1
├── npmlog@0.0.2 (ansi@0.1.2)
└── optimist@0.3.4 (wordwrap@0.0.2)
```

Now we are ready to write our simple server.

For brevity's sake, I'll just show the most relevant snippets, but the entire file is part of the
[app.js](https://github.com/thlorenz/dog-example-getting-started/blob/master/app.js) inside the [Getting Started Example
repository](https://github.com/thlorenz/dog-example-getting-started).

We need to require the necessary modules, among them director and dog, and initialize some variable that are global to
our server module.

{{ snippet: requires.js }}

Before we can serve the blog, we need to initialize it properly via the `dog.provider`.

Somewhat simplified and with error handling removed that comes down to the below snippet:

{{ snippet: init-blog.js }}

As the comments explain, we first tell dog, where our blog lives and store the actual css and all posts provided by dog
inside `blogCss` and `posts` respectively.

After the blog is initialized we are ready to serve it.

The following snippet is a bit long, but skimming it should give you a good idea how to serve your blog which at this
point is entirely contained in memory.

**Note:** some functions like `wrapnServe` have been omitted for brevity, but are included in the [source](https://github.com/thlorenz/dog-example-getting-started/blob/master/app.js).

{{ snippet: serve-site.js }}

Assuming you implemented or downloaded the entire code inside 'app.js' you can now `node app` to start the server.

Point your browser to `http://localhost:3000' to see the blog you are currently reading. Ironic isn't it?

### Creating new posts

In order to create new posts, all you have to do is create a directory inside your blog and put a 'post.md' inside of
it.

After that just follow the above instructions on how to publish a post and it will be included in your blog.

***

## Where to go for more information

If you enjoyed this tutorial and are interested in learning more about dog, please consult the readme that is included.  

You can either use the 'npm docs' command: `npm docs dog` or directly go to the [dog
repository](https://github.com/thlorenz/dog#readme) in order to find more information.

In case you find errors or have issues with dog, feel free to [raise an issue](https://github.com/thlorenz/dog/issues).
