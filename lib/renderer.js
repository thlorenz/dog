var fs     =  require('fs')
  , path   =  require('path')
  , marked =  require('marked')
  , nhs    =  require('node-syntaxhighlighter')
  , log    =  require('npmlog')
  , utl    =  require('./utl')
  ;
  
marked.setOptions({
  gfm       :  true,
  pedantic  :  false,
  sanitize  :  true,
  highlight :  function(code, lang) {
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

function collectSnippets(blogdir, collected) {
  var snippetsDir = path.join(blogdir, 'snippets');

  fs.exists(snippetsDir, function (exists) {
    if(!exists) { collected(null, []); return; }

    fs.readdir(snippetsDir, function (err, files) {
      if (err) { collected(err); return; }

      readSnippets(snippetsDir, files, collected);
    });
  });
}

function insertSnippets(blogdir, md, inserted) {
  collectSnippets(blogdir, function (err, snippets) {
    if (err) { inserted(err); return; }

    if (!snippets.length) { inserted(null, md); return; }

    snippets.forEach(function (snippet) {
      var detectedLang =  nhs.getLanguage(path.extname(snippet.name))
        , snippetLang  =  detectedLang ? detectedLang.Brush.aliases[0] : ''
        , regex        =  new RegExp('{{ +snippet: +' + utl.regexEscape(snippet.name) + ' +}}', 'gi')
        , replacement  =  [ '```' + snippetLang
                          , snippet.content
                          , '````'
                          ].join('\n');

      md = md.replace(regex, replacement);
    });

    inserted(null, md);
  });  
}

function render(blogdir, rendered) {
  var blogmd = path.join(blogdir, 'blog.md');

  utl.ensurePathExists(blogmd, function (err) {
    if(err) { rendered(err); return; }
    
    fs.readFile(blogmd, 'utf-8', function (err, data) {
      if (err) { rendered(err); return; }

      insertSnippets(blogdir, data, function (err, mdWithSnippets) {
        if (err) { rendered(err); return; }

        var html = marked(mdWithSnippets);
        rendered(null, html);
      });
    });
  });
}


module.exports = {
  render: render
};
