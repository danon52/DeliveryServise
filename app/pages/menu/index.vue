<template>
  <div v-for="product in data" :key="product.id" class="product-card">
    <img 
      v-if="product.photoUrl" 
      :src="product.photoUrl" 
      :alt="product.title"
      class="product-image"
    />    
    <div>
      <p><strong>{{ product.title }}</strong></p>
      <p>Состав: {{ product.composition }}</p>
      <p>Цена: {{ product.price }} ₽</p>
    </div>
    <div class="product-btn">
      <button @click="openEditModal(product)">Редактировать</button>
      <button @click="deleteProduct(product.id)">Удалить</button>
    </div>
  </div>
  
  <button @click="openCreateModal">Создать товар</button>
  
  <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
    <div class="modal-body">
      <h2>{{ isEditing ? 'Редактировать товар' : 'Создать товар' }}</h2>
      <form @submit.prevent="submitForm">
        <input 
          v-model="form.photoUrl" 
          type="url" 
          placeholder="URL фото" 
          required 
        />
        <input v-model="form.title" type="text" placeholder="Название" required />
        <input v-model="form.price" type="number" placeholder="Цена" required />
        <textarea
          v-model="form.composition"
          placeholder="Состав"
          required
        ></textarea>
        <button type="submit" :disabled="isLoading">
          {{ isLoading ? 'Сохранение...' : 'Сохранить' }}
        </button>
        <button type="button" @click="closeModal" class="cancel-btn">Отмена</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const { data } = await useFetch<Product[]>("/api/products");

const showModal = ref(false);
const isLoading = ref(false);
const isEditing = ref(false);
const editingProductId = ref<number | null>(null);

const form = reactive({
  photoUrl: "",
  title: "",
  composition: "",
  price: "",
});

function openCreateModal() {
  isEditing.value = false;
  editingProductId.value = null;
  resetForm();
  showModal.value = true;
}

function openEditModal(product: Product) {
  isEditing.value = true;
  editingProductId.value = product.id;
  form.photoUrl = product.photoUrl;
  form.title = product.title;
  form.composition = product.composition;
  form.price = String(product.price);
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  resetForm();
}

function resetForm() {
  form.photoUrl = "";
  form.title = "";
  form.composition = "";
  form.price = "";
}

async function submitForm() {
  isLoading.value = true;
  
  try {
    if (isEditing.value && editingProductId.value) {
      const resp = await $fetch<Product>(`/api/products/${editingProductId.value}`, {
        method: "PUT",
        body: {
          photoUrl: form.photoUrl,
          title: form.title,
          composition: form.composition,
          price: Number(form.price),
        },
      });

      if (resp && data.value) {
        const index = data.value.findIndex(p => p.id === editingProductId.value);
        if (index !== -1) {
          data.value[index] = resp;
        }
      }
    } else {
      const resp = await $fetch<Product>("/api/products", {
        method: "POST",
        body: {
          photoUrl: form.photoUrl,
          title: form.title,
          composition: form.composition,
          price: Number(form.price),
        },
      });

      if (resp && data.value) {
        data.value.push(resp);
      }
    }
    
    closeModal();
  } catch (error) {
    console.error("Ошибка:", error);
    alert(isEditing.value ? "Не удалось обновить продукт" : "Не удалось создать продукт");
  } finally {
    isLoading.value = false;
  }
}

async function deleteProduct(id: number) {
  if (!confirm("Вы уверены, что хотите удалить этот товар?")) return;
  
  try {
    await $fetch(`/api/products/${id}`, {
      method: "DELETE",
    });

    if (data.value) {
      data.value = data.value.filter(p => p.id !== id);
    }
  } catch (error) {
    console.error("Ошибка:", error);
    alert("Не удалось удалить продукт");
  }
}
</script>

<style scoped>
.product-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  background: #f9f9f9;
  display: flex;
  gap: 15px;
  align-items: flex-start;
}

.product-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
}

button{
  padding: 10px;
  border-radius: 10px;
  border: none;
  background-color: blanchedalmond;
  cursor: pointer;
}

button:hover {
  background-color: #e8c9a0;
}

.product-btn {
  display: grid;
  gap: 15px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.modal-body {
  width: 500px;
  background-color: #fff;
  padding: 25px;
  border-radius: 8px;
}

.modal-body h2 {
  margin-top: 0;
  margin-bottom: 20px;
}

.modal-body form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.modal-body input,
.modal-body textarea {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.modal-body textarea {
  min-height: 80px;
  resize: vertical;
}

.modal-body button {
  background-color: #a8fdab;
  color: black;
}

.modal-body button:hover {
  background-color: #45a049;
}

.cancel-btn {
  background-color: #a2a2a2 !important;
}

.cancel-btn:hover {
  background-color: #6f6f6f !important;
}
</style>