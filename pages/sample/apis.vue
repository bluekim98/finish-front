<script setup lang="ts">
import type { CaribbeanApiPostRequestBody, CaribbeanApiResponseBody } from '~/utils/api-types';
import { ref } from 'vue';
import { VRow, VTextField } from 'vuetify/components';
import type { paths } from '~/types/api';

const client = makeCaribbeanClient();
type MyType = CaribbeanApiResponseBody['/brand']['get'];

type MyType2 = paths['/sample']['get']['responses']['200']['content']['application/json'];

const versionRefs = ref<CaribbeanApiResponseBody['/sample']['get']>();
const inputTextRefs = ref<string>('');

type T = CaribbeanApiResponseBody['/brand']['post'];
type T2 = CaribbeanApiResponseBody['/brand/{brandId}']['patch'];

// const { data: a, error } = await client.GET('/brand');
// type RR = paths['/brand']['post']['responses']['201']

const fetchRequestBody = async () => {
  const { data, error } = await client.POST('/sample', {
    body: {
      hostname: 'test',
      startedAt: 'test',
      timezone: 'test',
      echoParam: inputTextRefs.value,
    },
  });
  versionRefs.value = data;
};

const fetchPathVariable = async () => {
  const { data, error } = await client.GET('/sample/{id}', {
    params: {
      path: {
        id: btoa(inputTextRefs.value),
      },
    },
  });
  if (data) versionRefs.value = data;
};

const fetchQueryParam = async () => {
  const { data, error } = await client.GET('/sample/{id}/param', {
    params: {
      path: {
        id: btoa(inputTextRefs.value),
      },
      query: {
        name: 'test',
        age: 30,
      },
    },
  });
  if (data) versionRefs.value = data;
};

const fetchError = async () => {
  const { data, error } = await client.POST('/sample/error/{id}', {
    params: {
      path: {
        id: btoa(inputTextRefs.value),
      },
    },
  });
  if (error) {
    alert(error.message);
  }
};

fetchRequestBody();

const uiState = reactive({
  dialog: false,
});
</script>
<template>
  <VContainer>
    <h1>Test</h1>
    <h3>hostname: {{ versionRefs?.hostname }}</h3>
    <h3>startedAt: {{ versionRefs?.startedAt }}</h3>
    <h3>timezone: {{ versionRefs?.timezone }}</h3>
    <h3>echoparam: {{ versionRefs?.echoParam }}</h3>
    <br />
    <VTextField placeholder="text" v-model="inputTextRefs"></VTextField>
    <br />
    <VRow style="gap: 8px">
      <VBtn
        @click="
          () => {
            fetchRequestBody();
          }
        "
      >
        request body
      </VBtn>
      <VBtn
        @click="
          () => {
            fetchPathVariable();
          }
        "
      >
        path variable
      </VBtn>
      <VBtn
        @click="
          () => {
            fetchQueryParam();
          }
        "
      >
        query param
      </VBtn>
      <VBtn
        @click="
          () => {
            fetchError();
          }
        "
      >
        error
      </VBtn>
      <VBtn
        @click="
          () => {
            uiState.dialog = true;
          }
        "
      >
        dialog
      </VBtn>
    </VRow>
    <VDialog v-model="uiState.dialog">
      <div>123</div>
      <!-- <brand-search-dialog v-model="uiState.searchDialog" @update:model-value="[]">
                </brand-search-dialog> -->
    </VDialog>
  </VContainer>
</template>
