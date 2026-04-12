// REST API 통신 모듈 (bucket-list의 storage.js 역할 대체)
const TodoAPI = {
  // 기본 fetch 래퍼
  async request(method, endpoint, body = null) {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`/api${endpoint}`, options);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '요청 실패');
      }

      return data.data;
    } catch (err) {
      console.error('API 에러:', err);
      throw err;
    }
  },

  // Todo 관련 API
  todos: {
    // 목록 조회 (필터링)
    async getAll(filters = {}) {
      const params = new URLSearchParams();
      if (filters.filter) params.append('filter', filters.filter);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.category_id) params.append('category_id', filters.category_id);

      return await TodoAPI.request('GET', `/todos?${params.toString()}`);
    },

    // 새 Todo 생성
    async create(data) {
      return await TodoAPI.request('POST', '/todos', data);
    },

    // Todo 수정
    async update(id, data) {
      return await TodoAPI.request('PUT', `/todos/${id}`, data);
    },

    // 완료 상태 토글
    async toggle(id) {
      return await TodoAPI.request('PATCH', `/todos/${id}/toggle`);
    },

    // Todo 삭제
    async delete(id) {
      return await TodoAPI.request('DELETE', `/todos/${id}`);
    }
  },

  // 카테고리 관련 API
  categories: {
    // 모든 카테고리 조회
    async getAll() {
      return await TodoAPI.request('GET', '/categories');
    },

    // 새 카테고리 생성
    async create(data) {
      return await TodoAPI.request('POST', '/categories', data);
    },

    // 카테고리 수정
    async update(id, data) {
      return await TodoAPI.request('PUT', `/categories/${id}`, data);
    },

    // 카테고리 삭제
    async delete(id) {
      return await TodoAPI.request('DELETE', `/categories/${id}`);
    }
  }
};
