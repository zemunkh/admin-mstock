<script setup>
import { ref, onMounted } from "vue";
// import { useMainStore } from "@/stores/main";
import * as chartConfig from "@/components/Charts/chart.config.js";
import SectionMain from "@/components/SectionMain.vue";
import CardBox from "@/components/CardBox.vue";
import TableSampleClients from "@/components/TableSampleClients.vue";
import LayoutAuthenticated from "@/layouts/LayoutAuthenticated.vue";

const chartData = ref(null);

const fillChartData = () => {
  chartData.value = chartConfig.sampleChartData();
};

onMounted(() => {
  fillChartData();
});

// const mainStore = useMainStore();
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <CardBox has-table>
        <TableSampleClients />
      </CardBox>
    </SectionMain>
  </LayoutAuthenticated>
</template>
