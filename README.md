# Pryv Explorer

Explore the data you stored on the Pryv service.

## Getting started

```
yeoman install
yeoman server
```
## Building and deploy on github

```
yeoman build
rm -rf components app/components
git checkout gh-pages
cp -R dist/* dist/.* .
git add <new files>
git tag v0.x.x
git commit -a -m "v0.x.x"
git push origin gh-pages
git push --tags
```
