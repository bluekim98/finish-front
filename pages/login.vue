<script setup lang="ts">
const form = ref({
  email: '',
  password: '',
  remember: false,
});

const isPasswordVisible = ref(false);

const { fetch: refreshSession } = useUserSession();

const { data, error, refresh } = useFetch('/api/auth/sign-in', {
  method: 'POST',
  body: form,
  immediate: false,
  watch: false,
});

const login = async () => {
  await refresh();
  if (error.value) {
    alert(error.value.data?.message || error.value.message);
  }
  if (data.value?.success) {
    await refreshSession();
    await navigateTo('/');
  }
};

definePageMeta({ layout: 'blank' });
</script>

<template>
  <!-- eslint-disable vue/no-v-html -->

  <div class="auth-wrapper d-flex align-center justify-center pa-4">
    <VCard class="auth-card pa-4 pt-7" min-width="448">
      <VCardItem class="justify-center">
        <NuxtLink to="/" class="d-flex align-center gap-3">
          <img src="/logo.png" alt="Logo" width="200px" />
        </NuxtLink>
      </VCardItem>

      <VCardText>
        <VForm @submit.prevent="login">
          <VRow>
            <!-- email -->
            <VCol cols="12">
              <VTextField v-model="form.email" label="이메일" type="email" />
            </VCol>

            <!-- password -->
            <VCol cols="12">
              <VTextField
                v-model="form.password"
                label="비밀번호"
                placeholder="······"
                :type="isPasswordVisible ? 'text' : 'password'"
                :append-inner-icon="isPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
                @click:append-inner="isPasswordVisible = !isPasswordVisible"
                class="mb-6"
              />

              <!-- login button -->
              <VBtn block type="submit">Login</VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </div>
</template>

<style lang="scss">
@use '@core/scss/template/pages/page-auth';
</style>
