# Fire project - vuejs admin module

This is Vue.js 3 module of admin components. With this module, you can build fire project admin site with Vue.

## Installation

- This module can be added as submoudle.

```sh
cd your-vue.js-project
git submodule add https://github.com/thruthesky/fire-admin-vue src/fire-admin-vue
```

## Initializing admin page

- You need to initialize firebase. The `main.ts` is a good place to do it.

```js
const firebaseConfig = { ... };
firebase.initializeApp(firebaseConfig);
```
