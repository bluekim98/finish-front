<script lang="ts" setup>
import VerticalNavSectionTitle from '@/@layouts/components/VerticalNavSectionTitle.vue';
import VerticalNavGroup from '@layouts/components/VerticalNavGroup.vue';
import VerticalNavLink from '@layouts/components/VerticalNavLink.vue';
</script>

<template>
  <VerticalNavSectionTitle
    :item="{
      heading: '매장 관리',
    }"
  />
  <VerticalNavLink
    :item="{
      title: '멤버십 관리',
      icon: 'ri-table-view',
      to: '/membership',
    }"
  />
</template>
