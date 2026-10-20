# MorseReceive GitHub Pages site

This folder is the static browser version of MorseReceive. It has no build step and works offline after the page loads.

## Publish with GitHub Pages

1. Push this project to a GitHub repository.
2. Open the repository's **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select your branch and choose **`/docs`** as the folder, then save.

GitHub will publish `docs/index.html` at the repository's Pages URL.

The trainer stores timing preferences and the profile name in the browser's local storage. Audio starts only after pressing a control, which keeps it compatible with browser autoplay rules.
