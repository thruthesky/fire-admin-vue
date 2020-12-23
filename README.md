# Fire project - vuejs admin module

This is Vue.js 3 module of admin components. With this module, you can build fire project admin site with Vue.

## Application

I will consider that you are installing `fire-admin-vue` in a new Vue.js 3 project. If not, update your code relatively.

### Install fire-admin-vue as submodule

- This module can be added as submoudle.

```sh
cd your-vue.js-project
git submodule add https://github.com/thruthesky/fire-admin-vue src/fire-admin-vue
```

### Install node mdoules

```sh
npm i firebase algoliasearch
```

### Initializing admin page

- You need to initialize firebase. The `main.ts` is a good place to do it.

```js
// ...
import firebase from "firebase/app";
firebase.initializeApp({
  /* ... firebase config ... */
});
import { AppService } from "@/fire-admin-vue/services/app.service";

createApp(App)
  .mixin({
    data() {
      return {
        app: new AppService() // to use `app` every where.
      };
    }
  })
  .use(store)
  .use(router)
  .mount("#app");
```

### Login

- Update `view/Home.vue` (or whereever you want) to display login and logout element.

```vue
<template>
  <div class="home">
    <LoginForm @success="success" @error="error" v-if="!app.user" />
    <div @click="app.logout" v-if="app.user">
      UID: {{ app.user.uid }}, Logout
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import LoginForm from "@/fire-admin-vue/components/LoginForm.vue";

@Options({
  components: {
    LoginForm
  }
})
export default class Home extends Vue {
  success() {
    console.log("login success");
  }
  error(e: any) {
    alert(e.code + " : " + e.message);
  }
}
</script>
```

### Add admin pages

Admin pages are divered into many sections and each of them are related by routes.

- Login as admin. If you don't know how to make an admin account, see fireflutter document.
-

### Customization

After adding basic login, logout, and admin pages, you are good to go for your web/app development. Do whatever you want from there.
