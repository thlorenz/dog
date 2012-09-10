var fs         =  require('fs')
  , path       =  require('path')
  , marked     =  require('marked')
  , runnel     =  require('runnel')
  , ap         =  require('ap')
  , nhs        =  require('node-syntaxhighlighter')
  , log        =  require('npmlog')
  , runnel     =  require('runnel')
  , dateformat =  require('dateformat')
  , utl        =  require('./utl')
  ;
  
marked.setOptions({
  gfm       :  true,
  pedantic  :  false,
  sanitize  :  true,
  highlight :  function(code, lang) {
    if (!lang) return code;
    var language = nhs.getLanguage(lang);
    return language ? nhs.highlight(code, language) : code;
  }
});

function readSnippets(snippetsDir, files, cb) {
  var tasks    =  files.length
    , snippets =  [];

  if (!tasks) { cb(null, snippets); return; }

  files.forEach(function (file) {
    var fullSnippetPath = path.join(snippetsDir, file);

    fs.readFile(fullSnippetPath, 'utf-8', function (err, data) {
      if (err) { cb(err); return; }

      snippets.push({ name: file, content: data });

      if (! --tasks) cb(null, snippets);
    });
  });
}

function collectSnippets(postdir, collected) {
  var snippetsDir = path.join(postdir, 'snippets');

  utl.exists(snippetsDir, function (yes) {
    if(!yes) { collected(null, []); return; }

    fs.readdir(snippetsDir, function (err, files) {
      if (err) { collected(err); return; }

      readSnippets(snippetsDir, files, collected);
    });
  });
}

function insertSnippets(postdir, md, inserted) {
  collectSnippets(postdir, function (err, snippets) {
    if (err) { inserted(err); return; }

    if (!snippets.length) { inserted(null, md); return; }

    snippets.forEach(function (snippet) {
      var detectedLang =  nhs.getLanguage(path.extname(snippet.name))
        , snippetLang  =  detectedLang ? detectedLang.Brush.aliases[0] : ''
        , regex        =  new RegExp('{{ +snippet: +' + utl.regexEscape(snippet.name) + ' +}}', 'gi')
        , replacement  =  [ '```' + snippetLang
                          , snippet.content
                          , '```'
                          ].join('\n');

      md = md.replace(regex, replacement);
    });

    inserted(null, md);
  });  
}

function insertMetadata (postdir, markdown, inserted) {
  var postjson = path.join(postdir, 'post.json');

  function resolveJson(postjsonExists, cb) {
    var unknown = 'Unknown until published';

    if (!postjsonExists) {
      cb( null
        , {
            title: unknown
          , created: new Date()
          , updated: new Date()
          , tags: [ unknown ]
          }
      );
      return;
    }

    fs.readFile(postjson, 'utf8', function (err, data) {
      if (err) { cb(err); return; }
      try {
        var json = JSON.parse(data);
        cb(null, json);
      } catch (e) {
        cb(e);
      }
    });
  }

  function insertTitle (meta, markdown) {
    return markdown.replace(/\{\{ {0,2}meta: {0,2}title {0,2} \}\}/, meta.title);
  }

  function insertCreated (meta, markdown) {
    return markdown.replace(
        /\{\{ {0,2}meta: {0,2}created {0,2} \}\}/
      , '<span class="created">' + dateformat(meta.created, 'dddd, mmmm dS, yyyy, h:MM:ss TT') + '</span>'
    );
  }

  function insertUpdated (meta, markdown) {
    return markdown.replace(
        /\{\{ {0,2}meta: {0,2}updated {0,2} \}\}/
      , '<span class="updated">' + dateformat(meta.updated, 'dddd, mmmm dS, yyyy, h:MM:ss TT') + '</span>'
    );
  }

  function insertTags (meta, markdown) {
    var tagItems = meta.tags
      .map(function (tag) { 
        return '  <li>' + tag + '</li>';
      })
      , tagList = ['\n<ul class="tags">']
          .concat(tagItems)
          .concat(['</ul>'])
          .join('\n');

    return markdown.replace(/\{\{ {0,2}meta: {0,2}tags {0,2} \}\}/, tagList);
  }

  runnel(
      function (cb) {
        fs.exists(postjson, function (exists) { cb(null, exists); });
      }
    , resolveJson
    , function (meta, cb) {
        try {
          var md = insertTitle(meta, markdown);
          md = insertCreated(meta, md);
          md = insertUpdated(meta, md);
          md = insertTags(meta, md);
          cb(null, md);
        } catch (e) {
          cb(e);
        }
      }
    , inserted
  );
  
}

function render(postdir, rendered) {
  var postmd = path.join(postdir, 'post.md');

  function wrap(mdWithSnippets, cb) {
    var html = [ 
        '<article class="blog-post">' 
      , marked(mdWithSnippets)
      , '</article>'
    ].join('\n');

    cb(null, html);
  }

  runnel(
      ap.partial(utl.ensurePathExists, postmd)
    , ap.partial(fs.readFile, postmd, 'utf8')
    , ap.partial(insertSnippets, postdir)
    , wrap
    , ap.partial(insertMetadata, postdir)
    , rendered
  );
}


module.exports = {
  render: render
};
