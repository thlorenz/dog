var fs         =  require('fs')
  , path       =  require('path')
  , marked     =  require('marked')
  , runnel     =  require('runnel')
  , ap         =  require('ap')
  , nhs        =  require('node-syntaxhighlighter')
  , peacock    =  require('peacock')
  , log        =  require('npmlog')
  , runnel     =  require('runnel')
  , dateformat =  require('dateformat')
  , utl        =  require('./utl')
  ;
  
function canBeHighlightedByPeacock(lang) {
  var lowerCaseLang = lang.toLowerCase();
  return lowerCaseLang === 'js' || lowerCaseLang === 'javascript';
}

marked.setOptions({
  gfm       :  true,
  pedantic  :  false,
  sanitize  :  false,
  highlight :  function(code, lang) {
    if (!lang) return code;
    if (canBeHighlightedByPeacock(lang)) {
      try {
        return peacock.highlight(code, { linenos: true });
      } catch(e) {
        // fall through to have node syntax highlighter give it a go
      }
    }

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
    if(!yes) return collected(null, []);

    fs.readdir(snippetsDir, function (err, files) {
      if (err) return collected(err);

      readSnippets(snippetsDir, files, collected);
    });
  });
}

function insertSnippets(postdir, md, inserted) {
  collectSnippets(postdir, function (err, snippets) {
    if (err) return inserted(err); 

    if (!snippets.length) return inserted(null, md);

    snippets.forEach(function (snippet) {
      var detectedLang =  nhs.getLanguage(path.extname(snippet.name))
        , snippetLang  =  detectedLang ? detectedLang.Brush.aliases[0] : '';

      var snipRegex        =  new RegExp('{{ +snippet: +' + utl.regexEscape(snippet.name) + ' +}}', 'gi')
        , snipReplacement  =  [ '```' + snippetLang
                              , snippet.content
                              , '```'
                              ].join('\n');
    var scriptieRegex        =  new RegExp('{{ +scriptie: +' + utl.regexEscape(snippet.name) + ' +}}', 'gi')
      , scriptieReplacement  =  [ '```jsst'
                                , snippet.content
                                , '```'
                                ].join('\n');

      md = md.replace(snipRegex, snipReplacement);
      md = md.replace(scriptieRegex, scriptieReplacement);
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
        utl.exists(postjson, function (exists) { cb(null, exists); });
      }
    , resolveJson
    , function (meta, cb) {
        try {
          var md = markdown;
          md = insertTitle(meta, md);
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

  var placeheld = []
    , placeholder = '# --- scriptie talkie placeholder ---'
    , placeholderHtml = '<h1 id="-scriptie-talkie-placeholder-">' + placeholder.slice(2) + '</h1>'


  function placeholdScriptieTalkies(markdown, cb) {
    var detect           =  /[`]{3,4}jsst/g
      , start            =  /^[`]{3,4}jsst *$/
      , end              =  /^[`]{3,4} *$/
      ;

    if (!detect.test(markdown)) return cb(null, markdown);

    var lines = markdown.split('\n')
      , insideScriptieTalkie = false
      , line
      , is = ''
      , currentScriptie;

    for (var i = 0; i < lines.length; i++) {
      line = lines[i];
      if (!insideScriptieTalkie) {
        if (!start.test(line)) continue;

        insideScriptieTalkie = true;
        lines.splice(i--, 1);
        currentScriptie = [];
        continue;
      }

      if (!end.test(line)) {
        // remove from content and keep for later
        currentScriptie.push(line);
        lines.splice(i--, 1);
        continue;
      }

      insideScriptieTalkie = false;
      lines[i] = placeholder;
      placeheld.push(currentScriptie.join('\n'));
    }
    cb(null, lines.join('\n'));
  }

  function insertScriptieTalkies(html, cb) {
    if (!placeheld.length) return cb(null, html);

    var lines = html.split('\n');
    lines.forEach(function (line, idx) {
      if (line === placeholderHtml) {
        lines[idx] =  '<textarea class="scriptie-talkie">'
                    + '\n' + placeheld.shift() 
                    + '\n</textarea>';
      }
    });
    cb(null, lines.join('\n'));
  }

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
    , placeholdScriptieTalkies
    , wrap
    , insertScriptieTalkies
    , ap.partial(insertMetadata, postdir)
    , rendered
  );
}

module.exports = {
  render: render
};

