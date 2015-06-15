# Contributing to ractive-isomorphic

## Getting help

There are a couple ways to get help before submitting an issue:
* /\*Official Documentation\*/
* [Gitter](https://gitter.im/zenflow/ractive-isomorphic)
* [@zenflow87 on Twitter](http://twitter.com/zenflow87)

## Raising security issues

If you think you've found a security vulnerability, email either 
[ractive-isomorphic-security@googlegroups.com](mailto:ractive-isomorphic-security@googlegroups.com)
or [ractive-js-security@googlegroups.com](mailto:ractive-js-security@googlegroups.com)
, depending on which repo you think is responsible. If you aren't sure, just send it to the former. 

Do __NOT__ share details of security issues in public __(i.e. github)__ as it could easily be exploited and 
that's not nice

## Raising other issues

Before submitting an issue, please make sure you're using the latest released version.

## Pull requests

Contributions in the form of code are highly encoureged!

This repository uses the [Gitflow Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow) 
model (which is cool to know about) but all you really need to know are the following points:

1. For hotfixes (i.e. patches), we branch from the `master` branch to a branch named `hotfix/x` where `x` is a short 
description of the fix.

2. For new features, we branch from the `dev` branch to a branch named `feature/x` where `x` is a short description of 
the feature.

3. For all pull requests, we run `npm test` before submitting, to be sure we didn't break anything. (How embarassing 
would that be?)