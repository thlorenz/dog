var path   =  require('path')
  , fs     =  require('fs')
  , runnel =  require('runnel')
  , log    =  require('npmlog')
  , utl    =  require('./utl')
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

  function createDirectories(cb) {
    log.info('scaffolder', 'Creating directories:');
    mkdirs(dirs, cb);
  } 

  function copyImages(cb) {
    log.info('scaffolder', 'Copying images');
    utl.copyFilesInside(imagessrc, images, cb);
  }

  function copyStyles(cb) {
    log.info('scaffolder', 'Copying styles');
    utl.copyFilesInside(stylessrc, styles, cb);
  }

  function copyIntroPost(cb) {
    log.info('scaffolder', 'Copying introductory post');
    utl.copyFilesInside(intropostsrc, intropost, cb);
  }

  function printHelpMessage(cb) {
    log.info('scaffolder', 'Your Developer blOG is now set up and contains an introductory post "intro-to-dog".');
    log.info('scaffolder', 'You can preview it by typing:   dog -a preview -p intro-to-dog');
    log.info('scaffolder', 'You can publish it by typing:   dog -a publish -p intro-to-dog -t "Dog Introduction" -g "dog cli nodejs"');
    log.info('scaffolder', 'You can unpublish it by typing: dog -a unpublish -p intro-to-dog');
    log.info('scaffolder', 'Happy blogging!');

    cb();
  }

  runnel(
      createDirectories
    , copyImages
    , copyStyles
    , copyIntroPost
    , printHelpMessage
    , scaffolded
  );
}

module.exports = {
  scaffold: scaffold
};
