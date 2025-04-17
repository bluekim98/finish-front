<script setup lang="ts">
import dayjs from 'dayjs';

const items = ref<CaribbeanApiResponseBody['/store/manager']['get']['items']>([]);
const totalPages = ref(1);

const defaultQuery: CaribbeanApiQueryParams['/store/manager']['get'] = {
  page: 1,
  pageSize: 10,
};

const query = reactive({
  ...defaultQuery,
});

const search = () => {
  fetchData();
};

const reset = () => {
  Object.assign(query, defaultQuery);
};

const fetchData = async () => {
  const { data } = await makeCaribbeanClient().GET('/store/manager', {
    params: {
      query: {
        ...query,
      },
    },
  });

  items.value = data?.items || [];
  totalPages.value = data?.pagination.totalPage || 1;
};

fetchData();

watch(
  () => [query.page, query.pageSize],
  () => {
    fetchData();
  },
);
</script>

<template>
  <p class="text-2xl">매장운영자 전화번호 조회</p>
  <VRow>
    <VCol cols="12">
      <VCard>
        <VForm ref="searchForm" class="my-6 mx-6" @submit.prevent="search" @keydown.enter="fetchData">
          <VRow>
            <VCol md="2">
              <VTextField v-model="query.estCd" label="매장코드" placeholder="매장코드" />
            </VCol>
            <VCol md="3">
              <VTextField v-model="query.storeName" label="매장명" placeholder="매장명" />
            </VCol>
            <VCol md="3">
              <VTextField v-model="query.upperEstCd" label="본점매장코드" placeholder="본점매장코드" />
            </VCol>
            <VCol md="3">
              <VTextField v-model="query.brandName" label="브랜드명" placeholder="브랜드명" />
            </VCol>
            <VCol md="3">
              <VTextField v-model="query.phone" label="전화번호" placeholder="전화번호" />
            </VCol>
            <VCol md="2">
              <VTextField v-model="query.userName" label="담당자이름" placeholder="담당자이름" />
            </VCol>

            <VCol cols="12" class="d-flex flex-wrap gap-4 justify-end">
              <VBtn color="secondary" variant="outlined" type="reset" @click.prevent="reset">초기화</VBtn>
              <VBtn
                @click="
                  () => {
                    query.page = 1;
                    fetchData();
                  }
                "
              >
                검색
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCard>
    </VCol>

    <VCol cols="12">
      <VCard>
        <VTable width="100%">
          <thead>
            <tr>
              <th class="text-center no-wrap">매장관리자 ID</th>
              <th class="text-center no-wrap">본점매장코드</th>
              <th class="text-center no-wrap">브랜드명</th>
              <th class="text-center no-wrap">매장코드</th>
              <th class="text-center no-wrap">매장명</th>
              <th class="text-center no-wrap">전화번호</th>
              <th class="text-center no-wrap">이름</th>
              <th class="text-center no-wrap">생성일시</th>
              <th class="text-center no-wrap">수정일시</th>
              <th class="text-center no-wrap">생성자</th>
              <th class="text-center no-wrap">수정자</th>
              <th class="text-center no-wrap">자동등록여부</th>
              <th class="text-center no-wrap">원본전화번호</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items ? items : []" :key="item.fcUserInfoId">
              <td class="text-center no-wrap">{{ item.fcUserInfoId }}</td>
              <td class="text-center no-wrap">{{ item.upperEstCd }}</td>
              <td class="text-center no-wrap">{{ item.brandName }}</td>
              <td class="text-center no-wrap">{{ item.estCd }}</td>
              <td class="text-center no-wrap">{{ item.storeName }}</td>
              <td class="text-center no-wrap">{{ item.phone }}</td>

              <td class="text-center no-wrap">
                {{ item.userName }}
              </td>
              <td class="text-center no-wrap">{{ dayjs(item.createDate).format('YYYY-MM-DD HH:mm:ss') }}</td>
              <td class="text-center no-wrap">{{ dayjs(item.updateDate).format('YYYY-MM-DD HH:mm:ss') }}</td>
              <td class="text-center no-wrap">{{ item.createUserId }}</td>
              <td class="text-center no-wrap">{{ item.updateUserId }}</td>
              <td class="text-center no-wrap">{{ item.batchInsertYn }}</td>
              <td class="text-center no-wrap">{{ item.originPhoneNumber }}</td>
            </tr>
          </tbody>
        </VTable>
      </VCard>
    </VCol>
  </VRow>

  <VPagination class="mt-4" v-model="query.page" :length="totalPages" total-visible="10" />
</template>

<style scoped>
.no-wrap {
  white-space: nowrap;
}

.td-title {
  width: 200px;
}

.td-text-field,
.td-row {
  padding-top: 10px;
  padding-bottom: 10px;
}
</style>
