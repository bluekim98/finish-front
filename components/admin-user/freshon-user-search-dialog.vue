<script setup lang="ts">
import type { CaribbeanApiQueryParams, CaribbeanApiResponseBody } from '~/utils/api-types';

const props = defineProps<{
  modelValue: boolean;
}>();

const defaultSearchCondition: CaribbeanApiQueryParams['/admin/user/fresh-on-user']['get'] = {
  keyword: '',
  page: 1,
  pageSize: 6,
};

const query = reactive({ ...defaultSearchCondition });
const items = ref<CaribbeanApiResponseBody['/admin/user/fresh-on-user']['get']['items']>([]);
const pagination = ref<CaribbeanApiResponseBody['/admin/user/fresh-on-user']['get']['pagination']>();

const fetchData = async () => {
  const { data } = await makeCaribbeanClient().GET('/admin/user/fresh-on-user', {
    params: {
      query: query,
    },
  });
  if (data) {
    items.value = data?.items;
    pagination.value = data?.pagination;
  }
};
const selectedRow = ref(null);

const emit = defineEmits(['update:modelValue', 'register']);

const registerAdmin = (item: CaribbeanApiResponseBody['/admin/user/fresh-on-user']['get']['items'][number]) => {
  emit('register', item); // 선택한 브랜드 전달
};
fetchData();
</script>
<template>
  <div class="rootDiv">
    <VCard class="rootCard">
      <div class="d-flex">
        <h2>프레시온 유저 검색</h2>
        <VBtn
          icon="$close"
          density="comfortable"
          variant="plain"
          style="margin-left: auto"
          @click="$emit('update:modelValue', false)"
        ></VBtn>
      </div>

      <div class="d-flex form-row">
        <VTextField
          class="right-element"
          label="프레시온유저아이디/유저이름"
          v-model="query.keyword"
          @keydown.enter="fetchData"
        ></VTextField>
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
        <VBtn
          color="grey-lighten-2"
          style="flex: 1; margin-left: 8px"
          @click="
            () => {
              query.keyword = undefined;
            }
          "
        >
          검색옵션초기화
        </VBtn>
      </div>
      <VDivider></VDivider>
      <VTable class="mt-5" height="400px" fixed-header>
        <thead>
          <tr>
            <th>유저아이디</th>
            <th>유저이름</th>
            <th>선택</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items ?? []" :key="item.userId" :class="{ 'selected-row': selectedRow === item.userId }">
            <td>{{ item.userId }}</td>
            <td>{{ item.userName }}</td>
            <td>
              <div class="d-flex flex-wrap gap-4 justify-end">
                <VBtn @click="registerAdmin(item)">외식업관리자등록</VBtn>
              </div>
            </td>
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
