<script setup lang="ts">
import dayjs from 'dayjs';
import Swal from 'sweetalert2';

const selectedFile = ref<File | null | undefined>(null);
const previewUrl = ref<string | null | undefined>(null);

const upperEstCd = ref<string | undefined>(undefined);
// const appIconKey = ref<string | undefined>(undefined);
const generate = ref<boolean>(false);
const formRef = ref<any>(null);

const props = defineProps<{
  dialog: boolean;
  id?: number;
}>();

const uiState = reactive({
  progress: false,
  progressMessage: '작업중입니다',
});

const item = ref<CaribbeanApiResponseBody['/app/icon/{id}']['get']>({
  id: 0,
  headquarterAppLauncherIconKey: '',
  appDistributionYn: 'N',
  createDate: '',
  updateDate: '',
});

const fetchData = async () => {
  if (props.id) {
    const { data } = await makeCaribbeanClient().GET('/app/icon/{id}', {
      params: {
        path: {
          id: props.id,
        },
      },
    });
    if (data) {
      item.value = data;
      previewUrl.value = data.thumbnailUri;
    }
  }
};

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

const emit = defineEmits(['update:dialog', 'refresh']);

const uploadFile = async () => {
  const { data } = await makeCaribbeanClient().POST('/files/upload', {
    body: {
      file: '',
    },
    bodySerializer: (body: any) => {
      if (selectedFile.value) {
        const formData = new FormData();
        formData.append('file', selectedFile.value);
        return formData;
      }
    },
  });
  return data;
};

const create = async () => {
  const uploadResult = await uploadFile();
  if (uploadResult) {
    const { data } = await makeCaribbeanClient().POST('/app/icon', {
      body: {
        headquarterAppLauncherIconKey: item.value?.headquarterAppLauncherIconKey!,
        iconAttachSeqId: uploadResult?.sysAttachInfoSeqId,
      },
    });
    emit('update:dialog', false);
    if (data) {
      Swal.fire({
        title: '저장성공',
        text: JSON.stringify(data),
        target: document.body,
      });
    }
  }
};

const update = async () => {
  const uploadResult = selectedFile.value ? await uploadFile() : undefined;
  if (uploadResult) {
    const { data, error } = await makeCaribbeanClient().PATCH('/app/icon', {
      body: {
        id: props.id!,
        iconAttachSeqId: uploadResult?.sysAttachInfoSeqId,
      },
    });
    emit('update:dialog', false);
    if (data) {
      Swal.fire('저장성공', JSON.stringify(data));
    }
    if (error) {
      Swal.fire('에러', error.message);
    }
  }
};

const save = async () => {
  const { valid } = (await formRef.value?.validate()) ?? false;
  if (!valid) {
    return;
  }
  if (props.id) {
    await update();
  } else {
    await create();
  }
  emit('refresh');
};

const onTextChange = (newValue: string) => {
  if (newValue && newValue.length >= 1) {
    item.value.headquarterAppLauncherIconKey = `FC_APP_ICON_${newValue}_${dayjs().format('YYYYMMDD_HHmmss_SSS')}`;
  } else {
    item.value.headquarterAppLauncherIconKey = '';
  }
  // 여기서 새로운 값에 대한 추가 처리를 수행할 수 있습니다.
};

const validateFile = (value: any): string | boolean => {
  // 파일이 없을 때
  if (!selectedFile.value) {
    return '파일을 선택하세요';
  }

  // 검증 통과
  return true;
};

if (props.id) fetchData();
</script>
<template>
  <VContainer>
    <VDialog v-model="uiState.progress" width="auto" :persistent="true">
      <v-card class="d-flex" style="justify-content: center; align-items: center; padding: 16px">
        <v-card-text>
          {{ uiState.progressMessage }}
        </v-card-text>
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </v-card>
    </VDialog>
    <VForm @submit.prevent="save" ref="formRef">
      <VCard class="mx-auto pa-4" max-width="500">
        <VCardTitle>앱런쳐아이콘</VCardTitle>
        <VCardText>
          <VTextField
            :readonly="!!props.id"
            :disabled="!!props.id"
            v-model="item.headquarterAppLauncherIconKey"
            label="앱 런쳐아이콘 키"
            placeholder="앱 런쳐아이콘 키"
            :rules="[(value: string) => !!value.trim() || '쿠폰이름을 입력하세요']"
          />
          <br />
          <div style="display: flex" v-if="!props.id">
            <VTextField
              :disabled="!generate"
              v-model="upperEstCd"
              label="본점고객코드로 키값 생성"
              placeholder="본점고객코드로 키값 생성"
              @update:modelValue="onTextChange"
            />
            <VSwitch
              v-model="generate"
              style="margin-left: 8px"
              @update:model-value="
                () => {
                  if (!generate) upperEstCd = undefined;
                }
              "
            ></VSwitch>
          </div>

          <br />
          <!-- 파일 선택 -->
          <VFileInput
            label="아이콘 파일 선택"
            variant="outlined"
            show-size
            accept="image/*"
            @update:modelValue="handleFileChange"
            :rules="[validateFile]"
          />

          <!-- 이미지 미리보기 -->
          <VImg v-if="previewUrl" :src="previewUrl" class="mt-3 rounded-lg" height="200px" contain alt="미리보기" />
        </VCardText>
        <VCardActions>
          <VBtn color="primary" type="submit">{{ props.id ? '수정' : '등록' }}</VBtn>
          <VBtn color="primary" @click="$emit('update:dialog', false)">취소</VBtn>
        </VCardActions>
      </VCard>
    </VForm>
  </VContainer>
</template>
<style scoped>
.swal-popup {
  z-index: 10000;
  /* Vuetify 기본 z-index보다 높게 설정 */
}
</style>
