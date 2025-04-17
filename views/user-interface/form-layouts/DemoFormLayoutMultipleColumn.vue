<script lang="ts" setup>
const firstName = ref('');
const lastName = ref('');
const city = ref('');
const country = ref('');
const company = ref('');
const email = ref('');
const checkbox = ref(false);
</script>

<template>
  <VForm @submit.prevent="() => {}">
    <VRow>
      <!-- 👉 First Name -->
      <VCol cols="12" md="6">
        <VTextField v-model="firstName" label="First Name" placeholder="First Name" />
      </VCol>

      <!-- 👉 Last Name -->
      <VCol cols="12" md="6">
        <VTextField v-model="lastName" label="Last Name" placeholder="Last Name" />
      </VCol>

      <!-- 👉 Email -->
      <VCol cols="12" md="6">
        <VTextField v-model="email" label="Email" placeholder="Email" />
      </VCol>

      <!-- 👉 City -->
      <VCol cols="12" md="6">
        <VTextField v-model="city" label="City" placeholder="City" />
      </VCol>

      <!-- 👉 Country -->
      <VCol cols="12" md="6">
        <VTextField v-model="country" label="Country" placeholder="Country" />
      </VCol>

      <!-- 👉 Company -->
      <VCol cols="12" md="6">
        <VTextField v-model="company" label="Company" placeholder="Company" />
      </VCol>

      <!-- 👉 Remember me -->
      <VCol cols="12">
        <VCheckbox v-model="checkbox" label="Remember me" />
      </VCol>

      <VCol cols="12" class="d-flex gap-4">
        <VBtn type="submit">Submit</VBtn>

        <VBtn type="reset" color="secondary" variant="outlined">Reset</VBtn>
      </VCol>
    </VRow>
  </VForm>
</template>
