// Tell dog where our blog lives
dog.provider.provideFrom(__dirname);

// Keep css for our blog in memory
dog.provider.concatenateStyles(function (err, css) {

  blogCss = css;
  
  // Keep all posts (including rendered html) in memory as well
  dog.provider.provideAll(function (err, metadata) {

    metadata.forEach(function (meta) {
      posts[meta.name] = meta;      
    });

    serveSite();
  });
});
