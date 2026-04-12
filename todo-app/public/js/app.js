// 메인 애플리케이션 로직 (bucket-list의 BucketListApp 패턴 계승)
class TodoApp {
  constructor() {
    this.currentFilter = 'all';
    this.currentPriority = '';
    this.currentCategory = '';
    this.editingId = null;
    this.todos = [];
    this.categories = [];
    this.init();
  }

  /**
   * 앱 초기화
   */
  async init() {
    this.cacheElements();
    this.bindEvents();
    await this.loadData();
    this.render();
  }

  /**
   * DOM 요소 캐싱
   */
  cacheElements() {
    // 폼 요소
    this.todoForm = document.getElementById('todoForm');
    this.todoInput = document.getElementById('todoInput');
    this.prioritySelect = document.getElementById('prioritySelect');
    this.categorySelect = document.getElementById('categorySelect');
    this.recurrenceSelect = document.getElementById('recurrenceSelect');

    // 통계 요소
    this.statsContainer = document.getElementById('statsContainer');

    // 리스트 컨테이너
    this.todoListContainer = document.getElementById('todoListContainer');
    this.emptyState = document.getElementById('emptyState');

    // 필터 버튼
    this.filterBtns = document.querySelectorAll('[data-filter]');
    this.priorityFilterBtns = document.querySelectorAll('[data-priority]');
    this.categoryFilterBtns = document.querySelectorAll('[data-category]');

    // 모달 요소
    this.editModal = document.getElementById('editModal');
    this.editForm = document.getElementById('editForm');
    this.editTitle = document.getElementById('editTitle');
    this.editPriority = document.getElementById('editPriority');
    this.editCategory = document.getElementById('editCategory');
    this.editRecurrence = document.getElementById('editRecurrence');
    this.cancelEditBtn = document.getElementById('cancelEdit');

    // 카테고리 모달
    this.categoryModal = document.getElementById('categoryModal');
    this.categoryForm = document.getElementById('categoryForm');
    this.categoryName = document.getElementById('categoryName');
    this.categoryColor = document.getElementById('categoryColor');
    this.cancelCategoryBtn = document.getElementById('cancelCategory');
    this.openCategoryModalBtn = document.getElementById('openCategoryModal');
  }

  /**
   * 이벤트 바인딩
   */
  bindEvents() {
    // 폼 제출
    this.todoForm.addEventListener('submit', (e) => this.handleAddTodo(e));

    // 필터 버튼
    this.filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => this.handleFilter(e));
    });

    this.priorityFilterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => this.handlePriorityFilter(e));
    });

    this.categoryFilterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => this.handleCategoryFilter(e));
    });

    // 수정 모달
    this.editForm.addEventListener('submit', (e) => this.handleEditSubmit(e));
    this.cancelEditBtn.addEventListener('click', () => this.closeEditModal());
    this.editModal.addEventListener('click', (e) => {
      if (e.target === this.editModal) this.closeEditModal();
    });

    // 카테고리 모달
    if (this.categoryForm) {
      this.categoryForm.addEventListener('submit', (e) => this.handleAddCategory(e));
      this.cancelCategoryBtn.addEventListener('click', () => this.closeCategoryModal());
      this.categoryModal.addEventListener('click', (e) => {
        if (e.target === this.categoryModal) this.closeCategoryModal();
      });
      this.openCategoryModalBtn.addEventListener('click', () => this.openCategoryModal());
    }
  }

  /**
   * 데이터 로드
   */
  async loadData() {
    try {
      this.todos = await TodoAPI.todos.getAll({
        filter: this.currentFilter,
        priority: this.currentPriority,
        category_id: this.currentCategory
      });
      this.categories = await TodoAPI.categories.getAll();
      this.updateCategorySelects();
    } catch (err) {
      console.error('데이터 로드 실패:', err);
      alert('데이터 로드에 실패했습니다.');
    }
  }

  /**
   * 새 Todo 추가
   */
  async handleAddTodo(e) {
    e.preventDefault();

    const title = this.todoInput.value.trim();
    if (!title) {
      alert('Todo를 입력해주세요!');
      return;
    }

    try {
      await TodoAPI.todos.create({
        title,
        priority: this.prioritySelect.value,
        category_id: this.categorySelect.value || null,
        recurrence: this.recurrenceSelect.value
      });

      this.todoInput.value = '';
      this.todoInput.focus();
      await this.loadData();
      this.render();
    } catch (err) {
      alert('Todo 추가에 실패했습니다.');
    }
  }

  /**
   * 필터 변경
   */
  handleFilter(e) {
    const filter = e.target.dataset.filter;
    this.currentFilter = filter;

    this.filterBtns.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');

    this.loadData().then(() => this.render());
  }

  /**
   * 우선순위 필터
   */
  handlePriorityFilter(e) {
    const priority = e.target.dataset.priority;
    this.currentPriority = this.currentPriority === priority ? '' : priority;

    this.priorityFilterBtns.forEach(btn => btn.classList.remove('active'));
    if (this.currentPriority) {
      e.target.classList.add('active');
    }

    this.loadData().then(() => this.render());
  }

  /**
   * 카테고리 필터
   */
  handleCategoryFilter(e) {
    const categoryId = e.target.dataset.category;
    this.currentCategory = this.currentCategory === categoryId ? '' : categoryId;

    this.categoryFilterBtns.forEach(btn => btn.classList.remove('active'));
    if (this.currentCategory) {
      e.target.classList.add('active');
    }

    this.loadData().then(() => this.render());
  }

  /**
   * Todo 완료 토글
   */
  async handleToggle(id) {
    try {
      await TodoAPI.todos.toggle(id);
      await this.loadData();
      this.render();
    } catch (err) {
      alert('상태 변경에 실패했습니다.');
    }
  }

  /**
   * Todo 삭제
   */
  async handleDelete(id, title) {
    if (confirm(`"${title}"\n정말 삭제하시겠습니까?`)) {
      try {
        await TodoAPI.todos.delete(id);
        await this.loadData();
        this.render();
      } catch (err) {
        alert('삭제에 실패했습니다.');
      }
    }
  }

  /**
   * 수정 모달 열기
   */
  openEditModal(id) {
    const todo = this.todos.find(t => t.id === id);
    if (!todo) return;

    this.editingId = id;
    this.editTitle.value = todo.title;
    this.editPriority.value = todo.priority;
    this.editCategory.value = todo.category_id || '';
    this.editRecurrence.value = todo.recurrence;

    this.editModal.classList.remove('hidden');
    this.editModal.classList.add('flex');
    this.editTitle.focus();
  }

  /**
   * 수정 모달 닫기
   */
  closeEditModal() {
    this.editingId = null;
    this.editModal.classList.add('hidden');
    this.editModal.classList.remove('flex');
  }

  /**
   * 수정 제출
   */
  async handleEditSubmit(e) {
    e.preventDefault();

    const title = this.editTitle.value.trim();
    if (!title) {
      alert('제목을 입력해주세요!');
      return;
    }

    try {
      await TodoAPI.todos.update(this.editingId, {
        title,
        priority: this.editPriority.value,
        category_id: this.editCategory.value || null,
        recurrence: this.editRecurrence.value
      });

      this.closeEditModal();
      await this.loadData();
      this.render();
    } catch (err) {
      alert('수정에 실패했습니다.');
    }
  }

  /**
   * 카테고리 모달 열기
   */
  openCategoryModal() {
    this.categoryModal.classList.remove('hidden');
    this.categoryModal.classList.add('flex');
    this.categoryName.focus();
  }

  /**
   * 카테고리 모달 닫기
   */
  closeCategoryModal() {
    this.categoryForm.reset();
    this.categoryModal.classList.add('hidden');
    this.categoryModal.classList.remove('flex');
  }

  /**
   * 카테고리 추가
   */
  async handleAddCategory(e) {
    e.preventDefault();

    const name = this.categoryName.value.trim();
    const color = this.categoryColor.value;

    if (!name) {
      alert('카테고리 이름을 입력해주세요!');
      return;
    }

    try {
      await TodoAPI.categories.create({ name, color });
      await this.loadData();
      this.closeCategoryModal();
      this.render();
    } catch (err) {
      alert('카테고리 추가에 실패했습니다.');
    }
  }

  /**
   * 카테고리 선택 옵션 업데이트
   */
  updateCategorySelects() {
    const categorySelects = [this.categorySelect, this.editCategory];

    categorySelects.forEach(select => {
      const currentValue = select.value;
      select.innerHTML = '<option value="">카테고리 선택 안함</option>';

      this.categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.name;
        select.appendChild(option);
      });

      select.value = currentValue;
    });

    // 카테고리 필터 버튼 업데이트
    this.updateCategoryFilterButtons();
  }

  /**
   * 카테고리 필터 버튼 동적 업데이트
   */
  updateCategoryFilterButtons() {
    const container = document.getElementById('categoryFilters');
    if (!container) return;

    container.innerHTML = '';

    this.categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'filter-btn px-6 py-2 rounded-lg font-medium transition-all';
      btn.setAttribute('data-category', cat.id);
      btn.textContent = cat.name;
      btn.style.borderColor = cat.color;
      btn.style.color = cat.color;

      btn.addEventListener('click', (e) => this.handleCategoryFilter(e));
      container.appendChild(btn);
    });
  }

  /**
   * 통계 계산
   */
  calculateStats() {
    const total = this.todos.length;
    const completed = this.todos.filter(t => t.completed).length;
    const progress = total - completed;
    const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

    return { total, completed, progress, completionRate };
  }

  /**
   * 화면 렌더링
   */
  render() {
    // 통계 업데이트
    const stats = this.calculateStats();
    document.getElementById('totalCount').textContent = stats.total;
    document.getElementById('completedCount').textContent = stats.completed;
    document.getElementById('progressCount').textContent = stats.progress;
    document.getElementById('completionRate').textContent = `${stats.completionRate}%`;

    // Todo 리스트 렌더링
    if (this.todos.length === 0) {
      this.todoListContainer.innerHTML = '';
      this.emptyState.classList.remove('hidden');
    } else {
      this.emptyState.classList.add('hidden');
      const html = this.todos
        .map(todo => renderTodoItem(todo, this.categories))
        .join('');
      this.todoListContainer.innerHTML = html;
    }
  }
}

// 앱 인스턴스 생성
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new TodoApp();
});
