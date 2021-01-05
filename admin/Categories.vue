<template>
  <div class="list">
    <h2>Categories page</h2>

    <h5 class="mt-5">New Category</h5>
    <table class="table table-sm mw-100 text-center">
      <tr>
        <td><input placeholder="ID" type="text" v-model="newCategory.id" /></td>
        <td>
          <input placeholder="Title" type="text" v-model="newCategory.title" />
        </td>
        <td>
          <input
            placeholder="Description"
            type="text"
            v-model="newCategory.description"
          />
        </td>
        <td>
          <button type="button" @click="onCreate">Add Category</button>
        </td>
      </tr>
    </table>

    <h4>Categories Table</h4>
    <table class="table table-sm mw-100">
      <tr class="text-center">
        <th scope="col">ID</th>
        <th scope="col">TITLE</th>
        <th scope="col">DESCRIPTION</th>
        <th scope="col">ACTIONS</th>
        <th scope="col">STATUS</th>
      </tr>
      <tr v-for="category in categories" :key="category.id">
        <td>{{ category.id }}</td>
        <td>
          <input
            type="text"
            v-model="category.title"
            @keyup="textChanges.next(category)"
          />
        </td>
        <td>
          <input
            type="text"
            v-model="category.description"
            @keyup="textChanges.next(category)"
          />
        </td>
        <td>
          <a :href="'/admin/settings/forum/' + category.id">Settings</a> |
          <button type="button" @click="onDelete(category.id)">Delete</button>
        </td>
        <td>
          <span v-if="category['loading']">Saving.</span>
          <span v-if="category['saved']">Saved!</span>
        </td>
      </tr>
    </table>

    <p v-show="fetchingCategories">Loading category list ..</p>
  </div>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";
import firebase from "firebase/app";
import "firebase/firestore";

import { Subject } from "rxjs";
import { debounceTime } from "rxjs/operators";

import { AppService } from "../services/app.service";

export default class Categories extends Vue {
  app = new AppService();

  categoriesCol = firebase.firestore().collection("categories");

  newCategory = {
    id: "",
    title: "",
    description: "",
  };

  categories: any[] = [];
  fetchingCategories = false;

  textChanges = new Subject();

  created() {
    this.fetchCategories();

    this.textChanges.pipe(debounceTime(400)).subscribe((data: any) => {
      this.onSave(data);
    });
  }

  async fetchCategories() {
    if (this.fetchingCategories) return;
    this.fetchingCategories = true;

    const snapshot = await this.categoriesCol.get();
    snapshot.docs.forEach((doc) => {
      this.categories.push(doc.data());
    });

    this.fetchingCategories = false;
  }

  async onCreate() {
    const docRef = this.categoriesCol.doc(this.newCategory.id);
    console.log(this.newCategory);
    try {
      await docRef.set(this.newCategory);
      this.categories.push(Object.assign({}, this.newCategory));
      this.newCategory.id = "";
      this.newCategory.title = "";
      this.newCategory.description = "";
      this.app.alert("Category created!");
    } catch (e) {
      this.app.error(e);
    }
  }

  async onSave(category: any) {
    const i = this.categories.findIndex((cat) => cat.id == category.id);
    if (this.categories[i]["loading"]) return;
    this.categories[i]["loading"] = true;

    try {
      await this.categoriesCol.doc(category.id).update({
        title: category.title ?? "",
        description: category.description ?? "",
      });
      setTimeout(() => {
        delete this.categories[i]["loading"];
        this.categories[i]["saved"] = true;
        setTimeout(() => {
          delete this.categories[i]["saved"];
        }, 500);
      }, 500);
    } catch (e) {
      this.app.error(e);
    }
  }

  async onDelete(id: string) {
    const conf = confirm("Delete Category?");
    if (!conf) return;
    try {
      await this.categoriesCol.doc(id).delete();
      const i = this.categories.findIndex((cat) => cat.id == id);
      this.categories.splice(i, 1);
      this.app.alert("Category " + id + " deleted!");
    } catch (e) {
      this.app.error(e);
    }
  }
}
</script>

<style lang="scss" scoped>
.table {
  width: 100%;
  & tr > th {
    border: 1px solid black;
  }
}

input {
  width: 100%;
}
</style>
