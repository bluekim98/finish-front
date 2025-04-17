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
      heading: '프랜차이즈 관리',
    }"
  />
  <VerticalNavLink
    :item="{
      title: 'FC 브랜드 관리',
      icon: 'ri-table-view',
      to: '/brands',
    }"
  />
  <VerticalNavLink
    :item="{
      title: '매장운영자 전화번호 조회',
      icon: 'ri-table-view',
      to: '/store/manager',
    }"
  />

  <!-- 시스템 관리 -->
  <VerticalNavSectionTitle
    :item="{
      heading: '시스템 관리',
    }"
  />
  <VerticalNavLink
    :item="{
      title: '어드민 관리',
      icon: 'ri-table-view',
      to: '/admin/user',
    }"
  />
  <VerticalNavLink
    :item="{
      title: '앱런쳐아이콘 관리',
      icon: 'ri-table-view',
      to: '/brands/appicon',
    }"
  />
</template>
