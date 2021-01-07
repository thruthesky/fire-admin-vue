<template>
  <div class="translations">
    <h1>Translations Page</h1>
    <br />
    <br />
    <table class="table">
      <tr>
        <td>
          <label for="newLanguange">New languange (code): </label>
          <input type="text" name="newLanguange" v-model="newLanguage" />
          <button @click="addNewLanguage">Add Language Code</button>
        </td>
      </tr>
    </table>

    <h4>Add new translation</h4>
    <table class="table">
      <tr>
        <th>Code</th>
        <th v-for="lc of languageCodes" :key="lc">
          {{ lc }}
        </th>
        <th>Actions</th>
      </tr>
      <tr>
        <td>
          <input
            type="text"
            name="newTranslationCode"
            v-model="newTranslationCode"
          />
        </td>
        <td v-for="lc of languageCodes" :key="lc">
          <input type="text" v-model="newTranslationTexts[lc]" />
        </td>
        <td>
          <button @click="onAddNewTranslationCode">Add</button>
        </td>
      </tr>
    </table>

    <br />
    <h4>Translations table</h4>
    <table class="table">
      <tr>
        <th>CODE</th>
        <th v-for="lc of languageCodes" :key="lc">
          {{ lc }}
        </th>
        <th>ACTIONS</th>
      </tr>
      <tr v-for="(texts, code) in translations" :key="code">
        <td>{{ code }}</td>
        <td v-for="lc in languageCodes" :key="lc">
          <input
            class="input-item"
            type="text"
            v-model="texts[lc]"
            @keyup="textChanges.next({ code: code, lc: lc })"
          />
        </td>
        <td>
          <!-- <span v-if="translations[code]['loading']">Saving...</span> -->
          <button
            type="button"
            style="color: red"
            @click="onDelete(code)"
            v-if="!translations[code]['loading']"
          >
            Delete
          </button>

          <span v-if="translations[code]['loading'] == 'saving'">Saving.</span>
          <span v-if="translations[code]['loading'] == 'saved'">Saved!</span>
        </td>
      </tr>
    </table>
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

  translationsCol = firebase.firestore().collection("translations");
  fetchingTranslations = false;

  newLanguage = "";
  newTranslationCode = "";
  newTranslationTexts: any = {};

  languageCodes: string[] = [];
  translations: {
    [key: string]: {
      [key: string]: {};
    };
  } = {};

  textChanges = new Subject();

  created() {
    this.fetchTranslations();

    this.textChanges.pipe(debounceTime(400)).subscribe((data: any) => {
      this.saveText(data.code, data.lc);
    });
  }

  async fetchTranslations() {
    this.fetchingTranslations = true;
    const res = await this.translationsCol.onSnapshot((snapshots) => {
      snapshots.docs.forEach((doc) => {
        const lc = doc.id;
        if (!this.languageCodes.includes(lc)) this.languageCodes.push(lc);
        const data = doc.data();
        let codes = Object.keys(data);
        codes = codes.sort();
        codes.forEach((code) => {
          if (!this.translations[code]) this.translations[code] = {};
          this.translations[code][lc] = data[code];
        });
      });
    });
  }

  async addNewLanguage() {
    if (!this.newLanguage) return;

    const keys = Object.keys(this.translations);
    const data: any = {};
    keys.forEach((key) => {
      data[key] = "";
    });

    try {
      await this.translationsCol.doc(this.newLanguage).set(data);
      this.languageCodes.push(this.newLanguage);
      this.newLanguage = "";
      alert("New language code added!");
    } catch (e) {
      this.app.error(e);
    }
  }

  onDelete(translationCode: string) {
    const conf = confirm("Delete translation for " + translationCode + "?");
    if (!conf) return;

    this.languageCodes.forEach(async (lc) => {
      try {
        this.translationsCol.doc(lc).update({
          [translationCode]: firebase.firestore.FieldValue.delete()
        });
        delete this.translations[translationCode];
      } catch (e) {
        this.app.error(e);
      }
    });
    alert("translation for " + translationCode + " deleted!");
  }

  onAddNewTranslationCode() {
    if (!this.newTranslationCode) {
      return this.app.error("Please enter translation code");
    }

    if (this.translations[this.newTranslationCode]) {
      return this.app.error("translation code already exists");
    }

    this.languageCodes.forEach(async (lc) => {
      try {
        await this.translationsCol
          .doc(lc)
          .set(
            { [this.newTranslationCode]: this.newTranslationTexts[lc] ?? "" },
            { merge: true }
          );

        this.newTranslationCode = "";
        this.newTranslationTexts = {};
      } catch (e) {
        this.app.error(e);
      }
    });
  }

  async saveText(code: string, lc: string) {
    if (this.translations[code]["loading"]) return;
    this.translations[code]["loading"] = "saving";
    try {
      await this.translationsCol
        .doc(lc)
        .set({ [code]: this.translations[code][lc] ?? "" }, { merge: true });

      setTimeout(() => {
        this.translations[code]["loading"] = "saved";
        setTimeout(() => {
          delete this.translations[code]["loading"];
        }, 500);
      }, 500);
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

.input-item {
  width: 100%;
}
</style>
