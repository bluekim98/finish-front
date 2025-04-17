<script setup lang="ts">
import { ref } from 'vue';
import Swal from 'sweetalert2';

const selectedFile = ref<File | null | undefined>(null);
const previewUrl = ref<string | null>(null);

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

// 파일 업로드 실행
const uploadFile = async () => {
  if (!selectedFile.value) {
    alert('파일을 선택하세요!');
    return;
  }

  // openapi-typescript 에서 multipart 를 제대로 변환하지 못하여 bodySerializer 사용
  const { data, error } = await makeCaribbeanClient().POST('/files/upload', {
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
  if (data) {
    Swal.fire('업로드성공', JSON.stringify(data));
  }
};
</script>

<template>
  <VContainer>
    <VCard class="mx-auto pa-4" max-width="500">
      <VCardTitle>파일 업로드</VCardTitle>
      <VCardText>
        <!-- 파일 선택 -->
        <VFileInput
          label="파일 선택"
          variant="outlined"
          show-size
          accept="image/*"
          @update:modelValue="handleFileChange"
        />

        <!-- 이미지 미리보기 -->
        <VImg v-if="previewUrl" :src="previewUrl" class="mt-3 rounded-lg" height="200px" contain alt="미리보기" />
      </VCardText>
      <VCardActions>
        <VBtn color="primary" @click="uploadFile">업로드</VBtn>
      </VCardActions>
    </VCard>
  </VContainer>
</template>
