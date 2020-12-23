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

- You need to initialize firebase. The `main.ts` is a good place to do it. See `AppService` instance has registered in global data object.

```js
// ...
import firebase from "firebase/app";
firebase.initializeApp({
  /* ... firebase config ... */
});
import { AppService } from "@/fire-admin-vue/services/app.service";
import { createApp } from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";

import firebase from "firebase/app";
import { firebaseConfig } from "../app.config";

firebase.initializeApp(firebaseConfig);
import { AppService } from "@/fire-admin-vue/services/app.service";
/// Create AppService instance only one time.
const appService = new AppService();
createApp(App)
  .mixin({
    data() {
      return {
        app: appService /// Don't instantiate AppService() here.
      };
    }
  })
  .use(store)
  .use(router)
  .mount("#app");
```

### Login

- Update `view/Home.vue` (or whereever you want) to display login, register, and logout element.

```vue
<template>
  <div class="home">
    <LoginForm @success="success" @error="error" v-if="!app.user" />
    <hr />
    <RegisterForm @success="success" @error="error" v-if="!app.user" />
    <div @click="app.logout" v-if="app.user">
      UID: {{ app.user.uid }}, Logout
    </div>
    <router-link to="/admin" v-if="app.isAdmin">Admin Dashboard</router-link>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import LoginForm from "@/fire-admin-vue/components/LoginForm.vue";
import RegisterForm from "@/fire-admin-vue/components/RegisterForm.vue";

@Options({
  components: {
    LoginForm,
    RegisterForm
  }
})
export default class Home extends Vue {
  success() {
    console.log("login or register success");
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
- Add link to admin dashboard.
- Add routes like below.

```js
import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Home from "../views/Home.vue";

import Admin from "../fire-admin-vue/admin/Admin.vue";
import AdminHome from "../fire-admin-vue/admin/AdminHome.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: Home
  },
  {
    path: "/about",
    name: "About",
    component: () => import("../views/About.vue")
  },
  {
    path: "/admin",
    name: "Admin",
    component: Admin,
    children: [
      {
        path: "",
        component: AdminHome
      },
      {
        path: "users/:uid",
        component: () => import("../fire-admin-vue/admin/Users.vue")
      },
      {
        path: "categories",
        name: "Categories",
        component: () => import("../fire-admin-vue/admin/Categories.vue")
      },
      {
        path: "posts/:category",
        name: "Posts",
        component: () => import("../fire-admin-vue/admin/posts/Posts.vue")
      },
      {
        path: "search-posts",
        name: "SearchPosts",
        component: () => import("../fire-admin-vue/admin/SearchPosts.vue")
      },
      {
        path: "photos/:path",
        name: "Photos",
        component: () => import("../fire-admin-vue/admin/Photos.vue")
      },
      {
        path: "settings",
        name: "Settings",
        component: () => import("../fire-admin-vue/admin/settings/Settings.vue")
      },
      {
        path: "settings/app",
        name: "AppSettings",
        component: () =>
          import("../fire-admin-vue/admin/settings/AppSettings.vue")
      },
      {
        path: "settings/forum/:category",
        name: "CategorySettings",
        component: () =>
          import("../fire-admin-vue/admin/settings/CategorySettings.vue")
      },
      {
        path: "translations",
        name: "Translations",
        component: () => import("../fire-admin-vue/admin/Translations.vue")
      },
      {
        path: "purchases",
        name: "Purchases",
        component: () =>
          import("../fire-admin-vue/admin/purchases/Purchases.vue")
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;
```

### Customization

After adding basic login, logout, and admin pages, you are good to go for your web/app development. Do whatever you want from there.

### Sample app
