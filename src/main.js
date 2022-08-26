import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
import PrimeVue from 'primevue/config';
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import ColumnGroup from "primevue/columngroup";
import InputText from "primevue/inputtext";
import Row from "primevue/row";
import { useMainStore } from "@/stores/main.js";
import { useStyleStore } from "@/stores/style.js";
import { darkModeKey, styleKey } from "@/config.js";
import 'primeicons/primeicons.css';
import "./css/main.css";

/* Init Pinia */
const pinia = createPinia();

/* Create Vue app */
const app = createApp(App);
app.use(router);
app.use(pinia);
app.use(PrimeVue);
app.component("DataTable", DataTable);
// eslint-disable-next-line vue/multi-word-component-names
app.component("Column", Column);
app.component("ColumnGroup", ColumnGroup);
// eslint-disable-next-line vue/multi-word-component-names
app.component("Row", Row);
app.component("InputText", InputText);

app.mount("#app");

/* Init Pinia stores */
const mainStore = useMainStore(pinia);
const styleStore = useStyleStore(pinia);

/* Fetch sample data */
mainStore.fetch("clients");
mainStore.fetch("history");

/* App style */
styleStore.setStyle(localStorage[styleKey] ?? "basic");

/* Dark mode */
if (
  (!localStorage[darkModeKey] &&
    window.matchMedia("(prefers-color-scheme: dark)").matches) ||
  localStorage[darkModeKey] === "1"
) {
  styleStore.setDarkMode(true);
}

/* Default title tag */
const defaultDocumentTitle = "Admin One Vue 3 Tailwind";

/* Set document title from route meta */
router.afterEach((to) => {
  document.title = to.meta?.title
    ? `${to.meta.title} — ${defaultDocumentTitle}`
    : defaultDocumentTitle;
});
