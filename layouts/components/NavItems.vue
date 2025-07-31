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
  <VerticalNavSectionTitle
    :item="{
      heading: '예약 관리',
    }"
  />
  <VerticalNavLink
    :item="{
      title: '예약 내역',
      icon: 'ri-file-list-2-line',
      to: '/reservation',
    }"
  />
</template>
