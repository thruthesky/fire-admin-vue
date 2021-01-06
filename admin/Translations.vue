<template>
  <div class="translations">
    <h1>Translations Page</h1>
    <br />
    <br />

    <h4>Add New languange (code):</h4>
    <table class="table mb-5 w-50">
      <tbody>
        <tr>
          <td>
            <input
              class="fs-6 py-2 w-100"
              type="text"
              name="newLanguange"
              v-model="newLanguangeCode"
            />
          </td>
          <td>
            <button class="btn btn-success" @click="addNewLanguageCode">Add Language Code</button>
          </td>
        </tr>
      </tbody>
    </table>

    <h4>Add new translation</h4>
    <table class="table mb-5">
      <thead>
        <tr>
          <th>Code</th>
          <th v-for="lc of languageCodes" :key="lc">
            {{ lc.toUpperCase() }}
          </th>
          <th>ACTIONS</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="py-2">
            <input
              class="fs-5 w-100"
              type="text"
              name="newTranslationCode"
              v-model="newTranslationCode"
            />
          </td>
          <td class="py-2" v-for="lc of languageCodes" :key="lc">
            <input
              class="fs-5 w-100"
              type="text"
              v-model="newTranslationTexts[lc]"
            />
          </td>
          <td>
            <button
              class="w-100 btn btn-success"
              @click="onAddNewTranslationCode"
            >
              Add
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <h4>Translations table</h4>
    <table class="table table-striped">
      <thead>
        <tr>
          <th>CODE</th>
          <th v-for="lc of languageCodes" :key="lc">
            {{ lc.toUpperCase() }}
          </th>
          <th>ACTIONS</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(texts, code) in translations" :key="code">
          <td>
            <input
              class="fs-5 w-100"
              type="text"
              :value="code"
              @keyup="
                textChanges.next({ code: code, newCode: $event.target.value })
              "
            />
          </td>
          <td class="p-2" v-for="lc in languageCodes" :key="lc">
            <input
              class="fs-5 w-100"
              type="text"
              v-model="texts[lc]"
              @keyup="textChanges.next({ code: code, lc: lc })"
            />
          </td>
          <td>
            <button
              class="w-100 btn btn-danger"
              type="button"
              @click="onDelete(code)"
              v-if="!translations[code]['loading']"
            >
              Delete
            </button>

            <span v-if="translations[code]['loading'] == 'saving'"
              >Saving.</span
            >
            <span v-if="translations[code]['loading'] == 'saved'">Saved!</span>
          </td>
        </tr>
      </tbody>
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

  newLanguangeCode = "";
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
      if (data.newCode) {
        this.onUpdateTranslationCode(data.code, data.newCode);
      } else {
        this.saveText(data.code, data.lc);
      }
    });
  }

  async fetchTranslations() {
    this.fetchingTranslations = true;

    const res = await this.translationsCol.onSnapshot((snapshots) => {
      this.translations = {};

      snapshots.docs.forEach((doc) => {
        const lc = doc.id;
        if (!this.languageCodes.includes(lc)) this.languageCodes.push(lc);
        const data = doc.data();
        let codes = Object.keys(data);
        codes = codes.sort();
        codes.forEach((code) => {
          if (!this.translations[code]) this.translations[code] = {};
          Object.assign(this.translations[code], { [lc]: data[code] });
        });
      });
    });
  }

  async addNewLanguageCode() {
    if (!this.newLanguangeCode) return;

    const keys = Object.keys(this.translations);
    const data: any = {};
    keys.forEach((key) => {
      data[key] = "";
    });

    try {
      await this.translationsCol.doc(this.newLanguangeCode).set(data);
      this.languageCodes.push(this.newLanguangeCode);
      this.newLanguangeCode = "";
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
          [translationCode]: firebase.firestore.FieldValue.delete(),
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

  onUpdateTranslationCode(code: string, newCode: string) {
    if (this.translations[newCode]) {
      return this.app.error("translation code already exists");
    }

    this.languageCodes.forEach(async (lc) => {
      try {
        await this.translationsCol.doc(lc).set(
          {
            [code]: firebase.firestore.FieldValue.delete(),
            [newCode]: this.translations[code][lc] ?? "",
          },
          { merge: true }
        );
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

