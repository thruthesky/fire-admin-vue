<template>
  <div class="register-form">
    <form @submit.prevent="onSubmit">
      <div>
        Email
        <input type="email" name="email" v-model="form.email" />
      </div>
      <div>
        Password
        <input type="password" name="password" v-model="form.password" />
      </div>
      <button type="submit">Register</button>
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
export default class RegisterForm extends Vue {
  form: any = {};

  async onSubmit() {
    try {
      const credential = await firebase
        .auth()
        .createUserWithEmailAndPassword(this.form.email, this.form.password);
      // (this.$data as any).app.alert("registered uid: " + credential?.user?.uid);
      this.$emit("success");
    } catch (e) {
      // (this.$data as any).app.error(e);
      this.$emit("error", e);
    }
    return;
  }
}
</script>

<style scoped lang="scss"></style>
