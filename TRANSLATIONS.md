# Translations

Thanks for showing your interest in helping us to translate the software.

## Creating a new translation

Before you start working on a new language, please look through the [open pull requests](https://github.com/canyon-project/canyon/pulls) to see if anyone is already working on a translation. If you find one, please join the discussion and help us keep the existing translations up to date.

if there is no existing translation, you can create a new one by following these steps:

1. **[Fork the repository](https://github.com/canyon-project/canyon/fork).**
2. **Checkout the `main` branch for latest translations.**
3. **Create a new branch for your translation with base branch `main`.**
4. **Create target language file in the [`/packages/canyon-platform/locales`](https://github.com/canyon-project/canyon/tree/main/packages/canyon-platform/locales) directory.**
5. **Copy the contents of the source file [`/packages/canyon-platform/locales/en.json`](https://github.com/canyon-project/canyon/blob/main/packages/canyon-platform/locales/en.json) to the target language file.**
6. **Translate the strings in the target language file.**
7. **Add your language entry to [`/packages/canyon-platform/languages.json`](https://github.com/canyon-project/canyon/blob/main/packages/canyon-platform/languages.json).**
8. **Save and commit changes.**
9. **Send a pull request.**

_You may send a pull request before all steps above are complete: e.g., you may want to ask for help with translations, or getting tests to pass. However, your pull request will not be merged until all steps above are complete._

Completing an initial translation of the whole site is a fairly large task. One way to break that task up is to work with other translators through pull requests on your fork. You can also [add collaborators to your fork](https://help.github.com/en/github/setting-up-and-managing-your-github-user-account/inviting-collaborators-to-a-personal-repository) if you'd like to invite other translators to commit directly to your fork and share responsibility for merging pull requests.

## Updating a translation

### Corrections

If you notice spelling or grammar errors, typos, or opportunities for better phrasing, open a pull request with your suggested fix. If you see a problem that you aren't sure of or don't have time to fix, [open an issue](https://github.com/canyon-project/canyon/issues/new/choose).

### Broken links

When tests find broken links, try to fix them across all translations. Ideally, only update the linked URLs, so that translation changes will definitely not be necessary.
