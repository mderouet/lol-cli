# Contributing to LoL CLI

First off, thank you for considering contributing to LoL CLI! It's people like you that make open source such a great community.

## Where do I go from here?

If you've noticed a bug or have a feature request, [make one](https://github.com/AntApper/lol-cli/issues/new)! It's generally best if you get confirmation of your bug or approval for your feature request this way before starting to code.

## Fork & create a branch

If this is something you think you can fix, then [fork LoL CLI](https://github.com/AntApper/lol-cli/fork) and create a branch with a descriptive name.

A good branch name would be (where issue #325 is the ticket you're working on):

```sh
git checkout -b 325-add-japanese-support
```

## Get the style right

Your patch should follow the same conventions & pass the same code quality checks as the rest of the project.

## Make a Pull Request

At this point, you should switch back to your master branch and make sure it's up to date with LoL CLI's master branch:

```sh
git remote add upstream git@github.com:AntApper/lol-cli.git
git checkout master
git pull upstream master
```

Then update your feature branch from your local copy of master, and push it!

```sh
git checkout 325-add-japanese-support
git rebase master
git push --force-with-lease origin 325-add-japanese-support
```

Finally, go to GitHub and [make a Pull Request](https://github.com/AntApper/lol-cli/compare)!

## Keeping your Pull Request updated

If a maintainer asks you to "rebase" your PR, they're saying that a lot of code has changed, and that you need to update your branch so it's easier to merge.

To learn more about rebasing and merging, check out this guide on [Git Workflows](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow).

## Merging a PR (for maintainers)

A PR can only be merged by a maintainer if it has at least one approval.

If you're a maintainer, you should:

- Thank the contributor for their work.
- Remind them to go to the [issues page](https://github.com/AntApper/lol-cli/issues) and close their issue, if they haven't already.
