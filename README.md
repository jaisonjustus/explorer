# Pryv Explorer

Explore the data you stored on the Pryv service.

## Getting started

```
yeoman install
yeoman server
```

# Build

## Setup

For building it is recommended to install a yeoman fork with minor diffs. Later on we should be able to go back to the original yeoman distribution when it will be possible to customize tasks further.

```
cd ~
git clone git://github.com/jonmaim/yeoman.git
cd yeoman/cli
npm install
```

## Building and publishing to gh-pages branch

```
~/yeoman/cli/bin/yeoman build
rm -rf components app/components;
git checkout gh-pages
cp -r dist/* dist/.* .
git add <new files>
git commit -a -m "v0.x.x"
git push origin gh-pages 
git tag v0.x.x
git push --tags
```
