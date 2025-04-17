<script setup lang="ts">
import dayjs from 'dayjs';
import { VImg } from 'vuetify/components';
import Swal from 'sweetalert2';

const items = ref<CaribbeanApiResponseBody['/app/icon']['get']['items']>([]);
const totalPages = ref(1);
const selectedFile = ref<File | null | undefined>(null);
const previewUrl = ref<string | null>(null);

const defaultQuery: CaribbeanApiQueryParams['/app/icon']['get'] = {
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
  const { data } = await makeCaribbeanClient().GET('/app/icon', {
    params: {
      query: {
        ...query,
      },
    },
  });

  items.value = data?.items || [];
  totalPages.value = data?.pagination.totalPage || 1;
};

const uiState = reactive({
  id: undefined as number | undefined,
  dialog: false,
  progress: false,
  progressMessage: '',
});

// 파일 선택 시 실행되는 함수
const handleFileChange = (files: File | File[] | undefined) => {
  if (!files) {
    selectedFile.value = null;
    previewUrl.value = null;
    return;
  }

  // 단일 파일 처리
  if (Array.isArray(files) && files.length > 0) {
    selectedFile.value = files[0]; // 첫 번째 파일 선택
  } else if (files instanceof File) {
    selectedFile.value = files;
  } else {
    selectedFile.value = null;
    previewUrl.value = null;
    return;
  }

  // 이미지 파일을 Blob URL로 변환하여 미리보기 생성
  if (selectedFile.value && selectedFile.value.type.startsWith('image/')) {
    previewUrl.value = URL.createObjectURL(selectedFile.value);
  } else {
    previewUrl.value = null; // 이미지가 아닌 경우 미리보기 제거
  }
};

const refresh = () => {
  query.page = 1;
  fetchData();
};

const downloadImage = (url: string | undefined, filename: string) => {
  if (url) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
};

const deleteIcon = async (id: number) => {
  const result = await Swal.fire({
    title: '경고',
    text: '삭제하시겠습니까?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: '예',
    cancelButtonText: '아니오',
  });
  if (!result.isConfirmed) {
    return;
  }

  const { data, error } = await makeCaribbeanClient().DELETE('/app/icon/{id}', {
    params: {
      path: {
        id: id,
      },
    },
  });
  if (error) {
    Swal.fire('에러', error.message);
    return;
  }
  Swal.fire('', '삭제 되었습니다.');
  fetchData();
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
  <div>
    <p class="text-2xl">앱런쳐아이콘 관리</p>
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
    <VDialog v-model="uiState.dialog" width="480px" :persistent="true">
      <AppiconDialog v-model:dialog="uiState.dialog" v-model:id="uiState.id" @refresh="refresh"></AppiconDialog>
    </VDialog>
    <VCol cols="12">
      <VCard>
        <VForm ref="searchForm" class="my-6 mx-6" @submit.prevent="search">
          <VRow>
            <VCol md="3">
              <VTextField v-model="query.keyword" label="앱 런쳐아이콘 키" placeholder="앱 런쳐아이콘 키" />
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
            (uiState.id = undefined), (uiState.dialog = true);
          }
        "
        @register=""
      >
        앱런쳐아이콘 등록
      </VBtn>
    </VRow>

    <VCol cols="12">
      <VCard>
        <VTable width="100%">
          <thead>
            <tr>
              <th class="text-center no-wrap">ID</th>
              <th class="text-center no-wrap">앱런쳐아이콘 키</th>
              <th class="text-center no-wrap">아이콘썸네일</th>
              <th class="text-center no-wrap">앱배포작업여부</th>
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
              <td class="text-center no-wrap">{{ item.headquarterAppLauncherIconKey }}</td>
              <td class="text-center no-wrap">
                <VImg :src="item.thumbnailUri" :style="{ maxHeight: '60px', padding: '2px' }"></VImg>
              </td>
              <td class="text-center no-wrap">{{ item.appDistributionYn }}</td>
              <td class="text-center no-wrap">{{ item.createUserId }}</td>
              <td class="text-center no-wrap">{{ item.updateUserId }}</td>
              <td class="text-center no-wrap">{{ dayjs(item.createDate).format('YYYY-MM-DD HH:mm:ss') }}</td>
              <td class="text-center no-wrap">{{ dayjs(item.updateDate).format('YYYY-MM-DD HH:mm:ss') }}</td>
              <td class="text-center no-wrap">
                <VBtn
                  @click="
                    () => {
                      uiState.id = item.id;
                      uiState.dialog = true;
                    }
                  "
                >
                  아이콘수정
                </VBtn>
                <VBtn style="margin-left: 0.25rem" @click="downloadImage(item.thumbnailUri, 'icon.png')">
                  아이콘보기
                </VBtn>
                <VBtn style="margin-left: 0.25rem" @click="deleteIcon(item.id)">삭제</VBtn>
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
