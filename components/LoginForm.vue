<template>
  <div class="login-form">
    <small class="form-hint">Please login</small>
    <h1 class="form-title">Login</h1>
    <form @submit.prevent="onSubmit">
      <div>
        <div class="form-label">Email</div>
        <input type="email" name="email" v-model="form.email" />
      </div>
      <div>
        <div class="form-label">Password</div>
        <input type="password" name="password" v-model="form.password" />
      </div>
      <button class="form-submit" type="submit">Login</button>
    </form>
  </div>
</template>

<script lang="ts">
import firebase from "firebase/app";
import "firebase/auth";

import { Vue, Options } from "vue-class-component";
@Options({
  emits: ["success", "error"]
})
export default class LoginForm extends Vue {
  form: any = {};

  async onSubmit() {
    try {
      const credential = await firebase
        .auth()
        .signInWithEmailAndPassword(this.form.email, this.form.password);
      this.$emit("success");
    } catch (e) {
      console.error(e);
      this.$emit("error", e);
    }
    return;
  }
}
</script>

<style scoped lang="scss"></style>
