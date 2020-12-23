import { ref } from "vue";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/functions";
import { Settings } from "./settings";
import { USER_NOT_EXISTS } from "./defines";

export class AppService {
  version = "0.0.5";
  user: any = ref(null);
  userData: any = ref(null);
  constructor() {
    console.log("AppService constructor()");
    Settings.init();

    firebase.auth().onAuthStateChanged(async (user) => {
      this.user.value = user;
      if (user) {
        const sanpshot = await firebase
          .firestore()
          .collection("users")
          .doc(user.uid)
          .get();
        if (sanpshot.exists) {
          this.userData.value = sanpshot.data();
        }
      } else {
        this.userData.value = {};
        // console.log("user Not logged in!");
      }
    });
  }

  get isAdmin(): boolean {
    return this.userData?.isAdmin;
  }

  logout() {
    firebase.auth().signOut();
  }

  error(e: any) {
    if (e.code && e.message) {
      alert(`${e.code}: ${e.message}`);
    } else {
      alert(e);
    }
  }
  alert(message: string) {
    alert(message);
  }

  getRandomString(len = 8, prefix = "") {
    const charset = "abcdefghijklmnopqrstuvwxyz0123456789";
    let t = "";
    for (let i = 0; i < len; i++) {
      t += charset[Math.floor(Math.random() * (charset.length + 1))];
    }
    if (prefix != null && prefix != "") t = prefix + t;
    return t;
  }

  getStorageFileFromUrl(url: string, folder: string): string {
    let arr = url.split("?");
    url = arr[0];
    arr = url.split(folder);
    url = folder + arr[1];
    url = url.replace("%2F", "/");
    return url;
  }

  async fileDelete(url: string) {
    const func = firebase
      .app()
      .functions("asia-northeast3")
      .httpsCallable("fileDelete");

    await func(url);
  }

  /**
   * Delete the user(s)
   *
   * An exception will be thrown if there is error.
   *
   * @param uid a string or a string list of user uid
   */
  async userDelete(uid: string | string[]) {
    const userDelete = firebase
      .app()
      .functions("asia-northeast3")
      .httpsCallable("userDelete");

    try {
      await userDelete(uid);
    } catch (e) {
      console.log(e.code, e.message, e.details);
      if (e.message == USER_NOT_EXISTS) {
        // continue deleting user data and public data.
        // user data may exists without user account.
      } else {
        throw e;
      }
    }

    try {
      const userDataDelete = firebase
        .app()
        .functions("asia-northeast3")
        .httpsCallable("userDataDelete");
      await userDataDelete(uid);
    } catch (e) {
      // ignore user data document delete since (somehow) the user may not have one
      console.log(e);
    }
    try {
      const userPublicDataDelete = firebase
        .app()
        .functions("asia-northeast3")
        .httpsCallable("userPublicDataDelete");
      await userPublicDataDelete(uid);
    } catch (e) {
      // ignore user data document delete since (somehow) the user may not have one
      console.log(e);
    }
  }
}
