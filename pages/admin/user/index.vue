<script setup lang="ts">
import dayjs from 'dayjs';

const items = ref<CaribbeanApiResponseBody['/admin/user']['get']['items']>([]);
const totalPages = ref(1);

const defaultQuery: CaribbeanApiQueryParams['/admin/user']['get'] = {
  keyword: undefined,
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
  const { data } = await makeCaribbeanClient().GET('/admin/user', {
    params: {
      query: {
        ...query,
      },
    },
  });

  items.value = data?.items || [];
  totalPages.value = data?.pagination.totalPage || 1;
};

const updateUser = async (item: CaribbeanApiResponseBody['/admin/user']['get']['items'][number]) => {
  uiState.progressMessage = '수정 작업중입니다';
  uiState.progress = true;
  const { data } = await makeCaribbeanClient().PATCH('/admin/user/update', {
    body: {
      username: item.userName,
      useYn: item.useYn === 'Y' ? 'N' : 'Y',
    },
  });
  query.page = 1;
  await fetchData();
  uiState.progress = false;
};

const registUser = async (item: CaribbeanApiResponseBody['/admin/user/fresh-on-user']['get']['items'][number]) => {
  if (item.userId) {
    uiState.dialog = false;
    uiState.progressMessage = '등록 작업중입니다';
    uiState.progress = true;
    const { data, error } = await makeCaribbeanClient().POST('/admin/user/register', {
      body: {
        username: item.userId,
      },
    });
    query.page = 1;
    await fetchData();
    uiState.progress = false;
  }
};

const uiState = reactive({
  dialog: false,
  progress: false,
  progressMessage: '',
});

fetchData();

watch(
  () => [query.page, query.pageSize],
  () => {
    fetchData();
  },
);
</script>

<template>
  <div>
    <p class="text-2xl">어드민 관리</p>
  </div>
  <VRow>
    <VDialog v-model="uiState.progress" width="auto" :persistent="true">
      <v-card class="d-flex" style="justify-content: center; align-items: center; padding: 16px">
        <v-card-text>
          {{ uiState.progressMessage }}
        </v-card-text>
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </v-card>
    </VDialog>
    <VDialog v-model="uiState.dialog" :persistent="true">
      <FreshonUserSearchDialog
        v-model="uiState.dialog"
        @update:model-value="
          (dialog) => {
            uiState.dialog = dialog;
          }
        "
        @register="registUser"
      ></FreshonUserSearchDialog>
    </VDialog>
    <VCol cols="12">
      <VCard>
        <VForm ref="searchForm" class="my-6 mx-6" @submit.prevent="search">
          <VRow>
            <VCol md="3">
              <VTextField v-model="query.keyword" label="유저아이디" placeholder="유저아이디" />
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
    <VRow
      cols="12"
      class="d-flex flex-wrap gap-4 justify-end"
      style="margin-right: 8px; margin-top: 8px; margin-bottom: 8px"
    >
      <VBtn
        @click="
          () => {
            uiState.dialog = true;
          }
        "
        @register=""
      >
        FreshOn 유저 외식업관리자 등록
      </VBtn>
    </VRow>

    <VCol cols="12">
      <VCard>
        <VTable width="100%">
          <thead>
            <tr>
              <th class="text-center no-wrap">ID</th>
              <th class="text-center no-wrap">유저 아이디</th>
              <th class="text-center no-wrap">유저 이름</th>
              <th class="text-center no-wrap">사용여부</th>
              <th class="text-center no-wrap">생성자</th>
              <th class="text-center no-wrap">수정자</th>
              <th class="text-center no-wrap">생성일시</th>
              <th class="text-center no-wrap">수정일시</th>
              <th class="text-center no-wrap">CTA</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items ? items : []" :key="item.id">
              <td class="text-center no-wrap">{{ item.id }}</td>
              <td class="text-center no-wrap">{{ item.userName }}</td>
              <td class="text-center no-wrap">{{ item.name }}</td>
              <td class="text-center no-wrap">{{ item.useYn }}</td>
              <td class="text-center no-wrap">{{ item.createUserId }}</td>
              <td class="text-center no-wrap">{{ item.updateUserid }}</td>
              <td class="text-center no-wrap">{{ dayjs(item.createDate).format('YYYY-MM-DD HH:mm:ss') }}</td>
              <td class="text-center no-wrap">{{ dayjs(item.updateDate).format('YYYY-MM-DD HH:mm:ss') }}</td>
              <td class="text-center no-wrap">
                <VCol class="d-flex flex-wrap gap-4 justify-end">
                  <VBtn v-if="item.useYn === 'Y'" @click="updateUser(item)">사용중지</VBtn>
                  <VBtn v-if="item.useYn !== 'Y'" @click="updateUser(item)">사용</VBtn>
                  <!-- <VBtn>삭제</VBtn> -->
                </VCol>
              </td>
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
