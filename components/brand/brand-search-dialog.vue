<script setup lang="ts">
import type { ApiQueryParams, ApiResponseBody } from '~/utils/api-types';

const props = defineProps<{
  modelValue: boolean;
}>();

const defaultSearchCondition: ApiQueryParams['/brand/convertible']['get'] = {
  keyword: '',
  page: 1,
  pageSize: 5,
  largeGbn: undefined,
};

const query = reactive({ ...defaultSearchCondition });
const items = ref<ApiResponseBody['/brand/convertible']['get']['items']>([]);
const pagination = ref<ApiResponseBody['/brand/convertible']['get']['pagination']>();

const fetchData = async () => {
  const { data } = await makeApiClient().GET('/brand/convertible', {
    params: {
      query: query,
    },
  });
  if (data) {
    items.value = data?.items;
    pagination.value = data?.pagination;
  }
};

const emit = defineEmits(['update:modelValue', 'select']);

const selectBrand = (brand: ApiResponseBody['/brand/convertible']['get']['items'][number]) => {
  emit('select', brand); // 선택한 브랜드 전달
  emit('update:modelValue', false); // 다이얼로그 닫기
};
</script>
<template>
  <div class="rootDiv">
    <VCard class="rootCard">
      <div class="d-flex">
        <h2>브랜드 검색</h2>
        <VBtn
          icon="$close"
          density="comfortable"
          variant="plain"
          style="margin-left: auto"
          @click="$emit('update:modelValue', false)"
        ></VBtn>
      </div>
      <div class="d-flex form-row">
        <VLabel class="title-element">브랜드명/코드</VLabel>
        <VTextField class="right-element" label="브랜드명/코드" v-model="query.keyword"></VTextField>
      </div>

      <div class="d-flex form-row" style="margin-top: 8px">
        <VBtn
          style="flex: 1"
          @click="
            () => {
              query.page = 1;
              fetchData();
            }
          "
        >
          검색
        </VBtn>
        <VBtn color="grey-lighten-2" style="flex: 1; margin-left: 8px" @click="() => {}">검색옵션초기화</VBtn>
      </div>
      <VDivider></VDivider>
      <VTable class="mt-5" height="400px" fixed-header>
        <thead>
          <tr>
            <th>브랜드코드</th>
            <th>매장이름</th>
            <th>본점고객코드</th>
            <th>고객-대분류</th>
            <th>고객-중분류</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items ?? []" :key="item.estCd" @click="selectBrand(item)">
            <td>{{ item.estCd }}</td>
            <td>{{ item.estName }}</td>
            <td>{{ item.upperEstCd }}</td>
            <td>{{ item.largeGbn }}</td>
            <td>{{ item.middleGbn }}</td>
          </tr>
        </tbody>
      </VTable>
      <div class="d-flex" style="margin-top: 8px; align-items: center">
        <VPagination
          v-model="query.page"
          :length="pagination?.totalPage ?? 0"
          @update:model-value="fetchData"
          :total-visible="query.pageSize"
        />
      </div>
    </VCard>
  </div>
</template>

<style scoped>
.rootCard {
  padding: 16px;
  max-height: 720px;
  overflow-y: auto;
}

.title-element {
  min-width: 96px;
}

.right-element {
  margin-left: 8px;
}

.form-row {
  display: block;
  border-style: solid;
  border-width: 1px;
  border-color: rgba(0, 0, 0, 0.05);
  margin-top: 8px;
  align-items: center;
  justify-content: flex-start;
}

td {
  font-size: 12px;
}
</style>
