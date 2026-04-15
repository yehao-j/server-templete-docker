<script setup>
import { onMounted, ref } from 'vue';

const message = ref('正在连接后端...');

onMounted(async () => {
  try {
    const response = await fetch('/api/health');
    const data = await response.json();
    message.value = data.message;
  } catch (error) {
    message.value = '后端暂时不可用，请确认 3000 端口服务已启动。';
  }
});
</script>

<template>
  <main class="page">
    <section class="card">
      <p class="eyebrow">Vue + Express</p>
      <h1>AtomicServer</h1>
      <p class="description">
        这是一个前后端分离的 Node.js 项目模板，前端运行在
        <strong>5173</strong>，后端运行在 <strong>3000</strong>。
      </p>
      <div class="status">{{ message }}</div>
    </section>
  </main>
</template>

<style scoped>
:global(body) {
  margin: 0;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  background:
    radial-gradient(circle at top, rgba(27, 94, 32, 0.12), transparent 32%),
    linear-gradient(135deg, #f4f7f1 0%, #e8efe3 100%);
  color: #1e2a22;
}

:global(*) {
  box-sizing: border-box;
}

.page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
}

.card {
  width: min(100%, 720px);
  padding: 40px 32px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 24px 60px rgba(45, 77, 54, 0.12);
  backdrop-filter: blur(12px);
}

.eyebrow {
  margin: 0 0 12px;
  font-size: 14px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #3a6d4a;
}

h1 {
  margin: 0;
  font-size: clamp(36px, 6vw, 56px);
  line-height: 1;
}

.description {
  margin: 20px 0 0;
  font-size: 18px;
  line-height: 1.7;
  color: #405349;
}

.status {
  margin-top: 28px;
  padding: 16px 18px;
  border-radius: 16px;
  background: #eff7ee;
  color: #21572f;
  font-weight: 600;
}
</style>
