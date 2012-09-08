var fs     =  require('fs')
  , path   =  require('path')
  , marked =  require('marked')
  , nhs    =  require('node-syntaxhighlighter')
  , log    =  require('npmlog')
  , runnel =  require('runnel')
  , curry  =  require('curry')
  , utl    =  require('./utl')
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
      curry([postmd], utl.ensurePathExists)
    , curry([postmd, 'utf8'], fs.readFile)
    , curry([postdir], insertSnippets)
    , wrap
    , rendered
  );
}


module.exports = {
  render: render
};
