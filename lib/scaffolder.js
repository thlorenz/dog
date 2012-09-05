var path = require('path')
  , fs = require('fs')
  , log = require('npmlog')
  , utl = require('./utl')
  ;

function mkdir(dir, cb) {
  log.info('scaffolder', 'mkdir', dir);
  fs.mkdir(dir, cb);
}

function mkdirs(dirs, cb) {
  var tasks = dirs.length
    , abort = false;

  dirs.forEach(function (dir) {
    mkdir(dir, function (err) {
      if (abort) return;
      if (err) { abort = true; cb(err); return; }
      if (--tasks === 0) cb();
    });
  });
}

// Once more scaffold options are needed, they can be passed here 
function scaffold(tgt, scaffolded) {
  var assets        =  path.join(tgt, 'assets')
    , images        =  path.join(assets, 'images')
    , styles        =  path.join(assets, 'styles')
    , intropost     =  path.join(tgt, 'intro-to-dog')

    , src           =  path.join(__dirname, '..', 'scaffold')
    , assetssrc     =  path.join(src, 'assets')
    , imagessrc     =  path.join(assetssrc, 'images')
    , stylessrc     =  path.join(assetssrc, 'styles')
    , intropostsrc  =  path.join(src, 'intro-to-dog')

    , dirs          =  [ assets, images, styles, intropost ]
    ;

  createDirectories();

  function createDirectories() {
    log.info('scaffolder', 'Creating directories:');

    mkdirs(dirs,function (err) {
      if (err) { scaffolded(err); return; }
      copyImages();
    });
  } 

  function copyImages() {
    log.info('scaffolder', 'Copying images');
    utl.copyFilesInside(imagessrc, images, function (err) {
      if (err) { scaffolded(err); return; }
      copyStyles();
    });
  }

  function copyStyles() {
    log.info('scaffolder', 'Copying styles');
    utl.copyFilesInside(stylessrc, styles, function (err) {
      if (err) { scaffolded(err); return; }
      copyIntroPost();
    });
  }

  function copyIntroPost() {
    log.info('scaffolder', 'Copying introductory post');
    utl.copyFilesInside(intropostsrc, intropost, function (err) {
      if (err) { scaffolded(err); return; }

      log.info('scaffolder', 'Your Developer blOG is now set up and contains an introductory post "intro-to-dog".');
      log.info('scaffolder', 'You can preview it by typing:   dog -a preview -p intro-to-dog');
      log.info('scaffolder', 'You can publish it by typing:   dog -a publish -p intro-to-dog -t "Dog Introduction" -g "dog cli nodejs"');
      log.info('scaffolder', 'You can unpublish it by typing: dog -a unpublish -p intro-to-dog');
      log.info('scaffolder', 'Happy blogging!');

      scaffolded();
    });
  }
}

module.exports = {
  scaffold: scaffold
};
