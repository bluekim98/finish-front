<script lang="ts" setup>
import VerticalNavSectionTitle from '@/@layouts/components/VerticalNavSectionTitle.vue';
import VerticalNavGroup from '@layouts/components/VerticalNavGroup.vue';
import VerticalNavLink from '@layouts/components/VerticalNavLink.vue';
</script>

<template>
  <!-- 👉 Dashboards -->
  <!-- <VerticalNavGroup
    :item="{
      title: 'Dashboards',
      badgeContent: '5',
      badgeClass: 'bg-error',
      icon: 'ri-home-smile-line',
    }"
  >
    <VerticalNavLink
      :item="{
        title: 'Analytics',
        to: '/dashboard',
      }"
    />
  </VerticalNavGroup> -->

  <!-- 프렌차이즈 관리 -->
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
