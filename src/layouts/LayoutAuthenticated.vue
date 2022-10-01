<script setup>
// import { mdiForwardburger, mdiBackburger, mdiMenu } from "@mdi/js";
import { useRouter } from "vue-router";
// import menuAside from "@/menuAside.js";
// import menuNavBar from "@/menuNavBar.js";
import { useMainStore } from "@/stores/main.js";
import { useLayoutStore } from "@/stores/layout.js";
// import { useStyleStore } from "@/stores/style.js";
// import BaseIcon from "@/components/BaseIcon.vue";
// import NavBar from "@/components/NavBar.vue";
// import NavBarItemPlain from "@/components/NavBarItemPlain.vue";
// import AsideMenu from "@/components/AsideMenu.vue";

useMainStore().setUser({
  name: "",
  email: "zemunkh@gmail.com",
  avatar:
    "https://avatars.dicebear.com/api/avataaars/example.svg?options[top][]=shortHair&options[accessoriesChance]=93",
});

// const layoutAsidePadding = "xl:pl-60";

// const styleStore = useStyleStore();

const layoutStore = useLayoutStore();

const router = useRouter();

router.beforeEach(() => {
  layoutStore.isAsideMobileExpanded = false;
  layoutStore.isAsideLgActive = false;
});
</script>

<template>
  <div class="overflow-hidden lg:overflow-visible">
    <div
      class="pt-1 min-h-screen w-screen transition-position lg:w-auto bg-gray-50"
    >
      <!-- <AsideMenu :menu="menuAside" @menu-click="menuClick" /> -->
      <slot />
    </div>
  </div>
</template>
