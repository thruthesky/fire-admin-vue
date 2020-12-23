import { ref } from "vue";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/functions";
import { Settings } from "./settings";

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
}
