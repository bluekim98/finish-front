<script setup lang="ts">
const props = defineProps({
  showMiddleCategorySearch: {
    type: Boolean,
    default: false,
  },
  selectMiddleCategoryItem: {
    type: Function,
    default: () => {},
  },
  closeSearchForm: {
    type: Function,
    default: () => {},
  },
});

const convertibleList = ref<ApiResponseBody['/brand/convertible']['get']['items']>([]);
const totalPages = ref(1);

const defaultQuery: ApiQueryParams['/brand/convertible']['get'] = {
  page: 1,
  pageSize: 9,
  keyword: '',
  largeGbn: '',
};

const query = reactive({
  ...defaultQuery,
});

const search = () => {
  fetchConvertibleList();
};

const reset = () => {
  Object.assign(query, defaultQuery);
  fetchConvertibleList();
};

const fetchConvertibleList = async () => {
  const { data } = await makeApiClient().GET('/brand/convertible', {
    params: {
      query,
    },
  });

  convertibleList.value = data?.items || [];
  totalPages.value = data?.pagination.totalPage || 1;
};

// 검색어를 입력한 경우, page 초기화
const handleKeywordChange = () => {
  query.page = 1;
};

fetchConvertibleList();

watch(
  () => [query.page, query.pageSize],
  () => {
    fetchConvertibleList();
  },
);
</script>

<template>
  <div v-if="props.showMiddleCategorySearch" class="d-flex flex-column h-100 justify-space-between">
    <div>
      <VForm class="my-6 mx-6" @submit.prevent="search">
        <VIcon
          style="position: absolute; right: 12px; top: 12px"
          icon="ri-close-line"
          @click="() => props.closeSearchForm()"
        />
        <p class="text-h5">본사고객코드 본점고객코드 검색</p>
        <VRow>
          <VCol>
            <VTextField
              v-model="query.keyword"
              label="고객코드 / 본점이름"
              placeholder="고객코드 / 본점이름"
              @change="handleKeywordChange"
            />
          </VCol>
          <VCol md="auto" class="d-flex flex-wrap gap-4 justify-end align-center">
            <VBtn color="secondary" variant="outlined" type="reset" @click.prevent="reset">초기화</VBtn>
            <VBtn type="submit">검색</VBtn>
          </VCol>
        </VRow>
      </VForm>

      <VTable>
        <thead>
          <tr>
            <th class="text-center no-wrap">고객코드</th>
            <th class="text-center no-wrap">본점이름</th>
            <th class="text-center no-wrap">지점 수</th>
            <th class="text-center no-wrap">본점코드</th>
            <th class="text-center no-wrap">고객 대분류</th>
          </tr>
        </thead>
        <tbody>
          <tr
            class="hovered-row"
            v-for="item in convertibleList"
            :key="item.estCd"
            @click="props.selectMiddleCategoryItem(item)"
          >
            <td class="text-center no-wrap">{{ item.estCd }}</td>
            <td class="text-center no-wrap">{{ item.estName }}</td>
            <td class="text-center no-wrap">{{ item.storeCount }}</td>
            <td class="text-center no-wrap">{{ item.upperEstCd }}</td>
            <td class="text-center no-wrap">{{ item.largeGbn }}</td>
          </tr>
        </tbody>
      </VTable>
    </div>

    <VPagination class="pb-4" v-model="query.page" :length="totalPages" total-visible="8" />
  </div>
</template>

<style scoped>
.no-wrap {
  white-space: nowrap;
}

.hovered-row:hover {
  cursor: pointer;
  background-color: #f5f5f5;
}
</style>
