<script setup lang="ts">
import Swal from 'sweetalert2';

const logout = async () => {
  try {
    const res = await $fetch('/api/auth/sign-out', {
      method: 'POST',
    });

    if (res.success) {
      await navigateTo('/login');
    }
  } catch (error) {
    Swal.fire({
      icon: 'error',
      html: `<div style="white-space: pre-wrap;">로그아웃 실패: 잠시 후 다시 시도해 주세요</div>`,
      buttonsStyling: false,
      confirmButtonText: `<div style="background-color: #179860; color: white; padding: 8px 18px; border-radius: 5px;">확인</div>`,
    });
  }
};
</script>

<template>
  <VListItem @click="logout">
    <template #prepend>
      <VIcon class="me-2" icon="ri-logout-box-r-line" size="22" />
    </template>

    <VListItemTitle>Logout</VListItemTitle>
  </VListItem>
</template>
